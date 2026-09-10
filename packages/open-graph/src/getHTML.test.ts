/*
 * Wire
 * Copyright (C) 2026 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

import {EventEmitter} from 'events';
import https = require('https');
import {PassThrough} from 'stream';

import {getHTML} from './openGraphParser';
import {LookupFunction} from './safeUrl';

const PUBLIC_V4 = '93.184.216.34';

interface FakeResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body?: string | Buffer;
}

interface RecordedRequest {
  url: string;
  options: https.RequestOptions;
}

let requestSpy: jest.SpyInstance;
let recorded: RecordedRequest[];

const lookupTable = (table: Record<string, string>): LookupFunction => {
  return async hostname => {
    const address = table[hostname];
    return address ? [{address, family: 4}] : [];
  };
};

const enqueueResponses = (responses: FakeResponse[]): void => {
  requestSpy.mockImplementation((url: string | URL, options: https.RequestOptions, callback: (res: any) => void) => {
    recorded.push({url: url.toString(), options});
    const next = responses.shift();
    const req = Object.assign(new EventEmitter(), {
      end: jest.fn(),
      destroy: jest.fn(function (this: any, error?: Error) {
        if (error) {
          this.emit('error', error);
        }
      }),
      setTimeout: jest.fn(),
    });

    if (!next) {
      throw new Error('unexpected request');
    }

    setImmediate(() => {
      const res = new PassThrough() as PassThrough & {statusCode: number; headers: Record<string, string>};
      res.statusCode = next.statusCode;
      res.headers = {'content-type': 'text/html; charset=utf-8', ...(next.headers ?? {})};
      callback(res);
      if (next.body !== undefined) {
        res.write(next.body);
      }
      res.end();
    });

    return req as unknown as https.ClientRequest;
  });
};

beforeEach(() => {
  recorded = [];
  requestSpy = jest.spyOn(https, 'request');
});

afterEach(() => {
  requestSpy.mockRestore();
});

describe('getHTML', () => {
  it('fetches a public https page', async () => {
    enqueueResponses([{statusCode: 200, body: '<html><head><title>ok</title></head></html>'}]);

    const html = await getHTML('https://example.com/page', 'ua', {lookup: lookupTable({'example.com': PUBLIC_V4})});

    expect(html).toContain('<title>ok</title>');
    expect(recorded).toHaveLength(1);
    expect(recorded[0].url).toBe('https://example.com/page');
    expect(recorded[0].options.headers).toMatchObject({'User-Agent': 'ua'});
  });

  it('connects to the address it validated rather than resolving again', async () => {
    enqueueResponses([{statusCode: 200, body: ''}]);

    await getHTML('https://example.com', 'ua', {lookup: lookupTable({'example.com': PUBLIC_V4})});

    const lookup = recorded[0].options.lookup!;
    const pinned = await new Promise<unknown>((resolve, reject) =>
      lookup('example.com', {}, (error, address) => (error ? reject(error) : resolve(address))),
    );
    expect(pinned).toBe(PUBLIC_V4);
  });

  it('rejects http without making a request', async () => {
    enqueueResponses([]);

    await expect(
      getHTML('http://example.com', 'ua', {lookup: lookupTable({'example.com': PUBLIC_V4})}),
    ).rejects.toThrow(/https/);
    expect(recorded).toHaveLength(0);
  });

  it('rejects a host that resolves to a private address without making a request', async () => {
    enqueueResponses([]);

    await expect(
      getHTML('https://intranet.example.com', 'ua', {lookup: lookupTable({'intranet.example.com': '10.1.2.3'})}),
    ).rejects.toThrow(/private/);
    expect(recorded).toHaveLength(0);
  });

  it('follows an https redirect to a public host', async () => {
    enqueueResponses([
      {statusCode: 302, headers: {location: 'https://other.example.com/final'}},
      {statusCode: 200, body: '<title>final</title>'},
    ]);

    const html = await getHTML('https://example.com', 'ua', {
      lookup: lookupTable({'example.com': PUBLIC_V4, 'other.example.com': '8.8.8.8'}),
    });

    expect(html).toContain('final');
    expect(recorded.map(r => r.url)).toEqual(['https://example.com/', 'https://other.example.com/final']);
  });

  it('resolves a relative redirect against the current URL', async () => {
    enqueueResponses([
      {statusCode: 301, headers: {location: '/moved'}},
      {statusCode: 200, body: 'moved'},
    ]);

    await getHTML('https://example.com/a/b', 'ua', {lookup: lookupTable({'example.com': PUBLIC_V4})});

    expect(recorded[1].url).toBe('https://example.com/moved');
  });

  it('refuses a redirect to a private address', async () => {
    enqueueResponses([{statusCode: 302, headers: {location: 'https://intranet.example.com/'}}]);

    await expect(
      getHTML('https://example.com', 'ua', {
        lookup: lookupTable({'example.com': PUBLIC_V4, 'intranet.example.com': '192.168.0.10'}),
      }),
    ).rejects.toThrow(/private/);
    expect(recorded).toHaveLength(1);
  });

  it('refuses a redirect to http', async () => {
    enqueueResponses([{statusCode: 302, headers: {location: 'http://example.com/'}}]);

    await expect(
      getHTML('https://example.com', 'ua', {lookup: lookupTable({'example.com': PUBLIC_V4})}),
    ).rejects.toThrow(/https/);
    expect(recorded).toHaveLength(1);
  });

  it('stops after the redirect limit', async () => {
    enqueueResponses([
      {statusCode: 302, headers: {location: 'https://example.com/1'}},
      {statusCode: 302, headers: {location: 'https://example.com/2'}},
      {statusCode: 302, headers: {location: 'https://example.com/3'}},
      {statusCode: 302, headers: {location: 'https://example.com/4'}},
      {statusCode: 200, body: 'never'},
    ]);

    await expect(
      getHTML('https://example.com', 'ua', {lookup: lookupTable({'example.com': PUBLIC_V4}), maxRedirects: 3}),
    ).rejects.toThrow(/redirect/i);
    expect(recorded).toHaveLength(4);
  });

  it('rejects a redirect without a location header', async () => {
    enqueueResponses([{statusCode: 302}]);

    await expect(
      getHTML('https://example.com', 'ua', {lookup: lookupTable({'example.com': PUBLIC_V4})}),
    ).rejects.toThrow(/redirect/i);
  });

  it('rejects non-2xx responses', async () => {
    enqueueResponses([{statusCode: 404, body: 'nope'}]);

    await expect(
      getHTML('https://example.com', 'ua', {lookup: lookupTable({'example.com': PUBLIC_V4})}),
    ).rejects.toThrow(/404/);
  });

  it('rejects responses that are not HTML', async () => {
    enqueueResponses([{statusCode: 200, headers: {'content-type': 'application/json'}, body: '{}'}]);

    await expect(
      getHTML('https://example.com', 'ua', {lookup: lookupTable({'example.com': PUBLIC_V4})}),
    ).rejects.toThrow(/text\/html/);
  });

  it('truncates the body at maxBodyLength', async () => {
    enqueueResponses([{statusCode: 200, body: 'x'.repeat(100)}]);

    const html = await getHTML('https://example.com', 'ua', {
      lookup: lookupTable({'example.com': PUBLIC_V4}),
      maxBodyLength: 10,
    });

    expect(html).toHaveLength(10);
  });

  it('rejects when the request errors', async () => {
    requestSpy.mockImplementation(() => {
      const req = Object.assign(new EventEmitter(), {end: jest.fn(), destroy: jest.fn(), setTimeout: jest.fn()});
      setImmediate(() => req.emit('error', new Error('ECONNRESET')));
      return req as unknown as https.ClientRequest;
    });

    await expect(
      getHTML('https://example.com', 'ua', {lookup: lookupTable({'example.com': PUBLIC_V4})}),
    ).rejects.toThrow(/ECONNRESET/);
  });

  it('applies a request timeout', async () => {
    enqueueResponses([{statusCode: 200, body: ''}]);

    await getHTML('https://example.com', 'ua', {lookup: lookupTable({'example.com': PUBLIC_V4}), timeoutMs: 1234});

    expect(recorded[0].options.timeout).toBe(1234);
  });
});
