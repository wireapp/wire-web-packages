/*
 * Wire
 * Copyright (C) 2020 Wire Swiss GmbH
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

import {parseHTML} from './openGraphParser';

const meta = (property: string, content = 'value'): string => `<meta property="${property}" content="${content}">`;

const withHead = (...tags: string[]): string => `<html><head>${tags.join('')}</head><body></body></html>`;

const ownKeysDeep = (value: unknown, found: string[] = []): string[] => {
  if (value && typeof value === 'object') {
    for (const key of Object.getOwnPropertyNames(value)) {
      found.push(key);
      ownKeysDeep((value as Record<string, unknown>)[key], found);
    }
  }
  return found;
};

describe('parseHTML', () => {
  describe('prototype pollution', () => {
    const objectProtoBefore = Object.getOwnPropertyNames(Object.prototype);
    const arrayProtoBefore = Object.getOwnPropertyNames(Array.prototype);

    const payloads: Record<string, string> = {
      'direct __proto__': meta('og:__proto__:polluted'),
      'direct constructor.prototype': meta('og:constructor:prototype:polluted'),
      'uppercase variants': meta('og:__PROTO__:polluted') + meta('og:CONSTRUCTOR:PROTOTYPE:polluted'),
      'via string-to-object conversion': meta('og:x') + meta('og:x:__proto__:polluted'),
      'via string-to-object then constructor': meta('og:x') + meta('og:x:constructor:prototype:polluted'),
      'via array intermediate': meta('og:x') + meta('og:x') + meta('og:x:__proto__:polluted'),
      'via array then constructor': meta('og:x') + meta('og:x') + meta('og:x:constructor:polluted'),
      'via shorthand pivot': meta('og:image:__proto__:polluted'),
      'via custom namespace': `<html xmlns:__proto__="http://opengraphprotocol.org/schema/"></html>${meta(
        '__proto__:polluted',
      )}`,
      'via stripped characters': meta('og:_ _proto_ _:polluted') + meta('og:con!structor:proto!type:polluted'),
      'deep nesting': meta('og:a:b:__proto__:polluted'),
    };

    it.each(Object.entries(payloads))('does not pollute prototypes: %s', (_label, html) => {
      parseHTML(withHead(html));

      expect(Object.getOwnPropertyNames(Object.prototype)).toEqual(objectProtoBefore);
      expect(Object.getOwnPropertyNames(Array.prototype)).toEqual(arrayProtoBefore);
      expect(({} as Record<string, unknown>).polluted).toBeUndefined();
      expect(([] as unknown as Record<string, unknown>).polluted).toBeUndefined();
    });

    it.each(Object.entries(payloads))('never emits a blacklisted key: %s', (_label, html) => {
      const result = parseHTML(withHead(html));
      const keys = ownKeysDeep(result);

      expect(keys).not.toContain('__proto__');
      expect(keys).not.toContain('constructor');
      expect(keys).not.toContain('prototype');
    });

    it('returns a root object without a prototype', () => {
      const result = parseHTML(withHead(meta('og:title', 'x')));
      expect(Object.getPrototypeOf(result)).toBeNull();
    });

    it('creates nested nodes without a prototype', () => {
      const result = parseHTML(withHead(meta('og:image:width', '1')));
      expect(Object.getPrototypeOf(result.image)).toBeNull();
    });

    it('converts a string node to an object without a prototype', () => {
      const result = parseHTML(withHead(meta('og:x', 'a') + meta('og:x:y', 'b')));
      expect(Object.getPrototypeOf(result.x)).toBeNull();
      expect(result.x).toEqual({'': 'a', y: 'b'});
    });
  });

  describe('property keys', () => {
    it('lowercases keys', () => {
      expect(parseHTML(withHead(meta('og:Site_Name', 'x'))).site_name).toBe('x');
    });

    it('strips characters outside the allowed set', () => {
      expect(parseHTML(withHead(meta('og:ti<t>le', 'x'))).title).toBe('x');
    });

    it('drops keys longer than maxPropertyLength', () => {
      const result = parseHTML(withHead(meta(`og:${'a'.repeat(201)}`, 'x')));
      expect(Object.keys(result)).toEqual(['title']);
    });

    it('drops a tag whose intermediate key is empty', () => {
      const result = parseHTML(withHead(meta('og:x::y', 'v')));
      expect(result.x).toBeUndefined();
    });

    it('ignores properties outside the namespace', () => {
      const result = parseHTML(withHead(meta('twitter:title', 'x') + meta('description', 'y')));
      expect(Object.keys(result)).toEqual(['title']);
    });

    it('truncates to four path segments', () => {
      const result = parseHTML(withHead(meta('og:a:b:c:d:e', 'v')));
      expect(result).toEqual({a: {b: {c: {d: 'v'}}}, title: ''});
    });
  });

  describe('content sanitization', () => {
    it('strips HTML but keeps text', () => {
      const result = parseHTML(withHead(meta('og:title', '&lt;b&gt;bold&lt;/b&gt; &lt;script&gt;x()&lt;/script&gt;')));
      expect(result.title).toBe('bold');
    });

    it('removes script-like URI schemes', () => {
      const result = parseHTML(withHead(meta('og:url', 'javascript:alert(1)')));
      expect(result.url).toBe('alert(1)');
    });

    it('drops tags whose content is empty after sanitization', () => {
      const result = parseHTML(withHead(meta('og:url', '&lt;img src=x&gt;')));
      expect(result.url).toBeUndefined();
    });

    it('truncates content to maxContentLength', () => {
      const result = parseHTML(withHead(meta('og:description', 'a'.repeat(50))), {maxContentLength: 10});
      expect(result.description).toBe('a'.repeat(10));
    });
  });

  describe('output shape', () => {
    it('collects repeated properties into an array', () => {
      const result = parseHTML(withHead(meta('og:image', 'a') + meta('og:image', 'b')));
      expect(result.image).toEqual({url: ['a', 'b']});
    });

    it('expands the image shorthand and nests its attributes', () => {
      const result = parseHTML(
        withHead(meta('og:image', 'a') + meta('og:image:width', '1') + meta('og:image:height', '2')),
      );
      expect(result.image).toEqual({url: 'a', width: '1', height: '2'});
    });

    it('attaches nested attributes to the most recent array entry', () => {
      const result = parseHTML(withHead(meta('og:x', 'a') + meta('og:x', 'b') + meta('og:x:y', '9')));
      expect(result.x).toEqual(['a', {'': 'b', y: '9'}]);
    });

    it('falls back to the title tag when og:title is absent', () => {
      const result = parseHTML(withHead('<title>Page</title>'));
      expect(result.title).toBe('Page');
    });

    it('prefers og:title over the title tag', () => {
      const result = parseHTML(withHead(`<title>Page</title>${meta('og:title', 'OG')}`));
      expect(result.title).toBe('OG');
    });

    it('falls back to the first image when og:image is absent', () => {
      const result = parseHTML('<html><body><img src="https://a/b.png" width="10" height="x"></body></html>');
      expect(result.image).toEqual({url: 'https://a/b.png', width: '10'});
    });
  });

  describe('namespace handling', () => {
    it('honours an explicitly declared namespace', () => {
      const html = `<html xmlns:foo="http://opengraphprotocol.org/schema/"><head>${meta('foo:title', 'x')}</head></html>`;
      expect(parseHTML(html).title).toBe('x');
    });

    it('in strict mode returns nothing when no namespace is declared', () => {
      expect(parseHTML(withHead(meta('og:title', 'x')), {strict: true})).toEqual({});
    });

    it('in strict mode parses when the namespace is declared', () => {
      const html = `<html xmlns:og="http://opengraphprotocol.org/schema/"><head>${meta('og:title', 'x')}</head></html>`;
      expect(parseHTML(html, {strict: true}).title).toBe('x');
    });
  });
});
