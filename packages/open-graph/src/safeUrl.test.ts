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

import {isPrivateAddress, resolveSafeUrl, LookupFunction} from './safeUrl';

const PUBLIC_V4 = '93.184.216.34';
const PUBLIC_V6 = '2606:2800:220:1:248:1893:25c8:1946';

const lookupReturning =
  (...addresses: string[]): LookupFunction =>
  async () =>
    addresses.map(address => ({address, family: address.includes(':') ? 6 : 4}));

describe('isPrivateAddress', () => {
  it.each([
    ['0.0.0.0', 'unspecified'],
    ['0.1.2.3', 'this-network'],
    ['10.0.0.1', 'RFC 1918 10/8'],
    ['100.64.0.1', 'CGNAT 100.64/10'],
    ['127.0.0.1', 'loopback'],
    ['127.255.255.254', 'loopback range'],
    ['169.254.169.254', 'link-local / cloud metadata'],
    ['172.16.0.1', 'RFC 1918 172.16/12'],
    ['172.31.255.255', 'RFC 1918 172.16/12 upper bound'],
    ['192.0.0.1', 'IETF protocol assignments'],
    ['192.168.1.1', 'RFC 1918 192.168/16'],
    ['198.18.0.1', 'benchmarking'],
    ['224.0.0.1', 'multicast'],
    ['240.0.0.1', 'reserved'],
    ['255.255.255.255', 'broadcast'],
    ['::', 'IPv6 unspecified'],
    ['::1', 'IPv6 loopback'],
    ['fc00::1', 'IPv6 unique local'],
    ['fd12:3456::1', 'IPv6 unique local upper'],
    ['fe80::1', 'IPv6 link-local'],
    ['ff02::1', 'IPv6 multicast'],
    ['::ffff:127.0.0.1', 'IPv4-mapped loopback'],
    ['::ffff:10.0.0.1', 'IPv4-mapped RFC 1918'],
    ['::ffff:7f00:1', 'IPv4-mapped loopback in hex form'],
    ['::ffff:a9fe:a9fe', 'IPv4-mapped metadata in hex form'],
    ['64:ff9b::7f00:1', 'NAT64 loopback'],
    ['64:ff9b::a9fe:a9fe', 'NAT64 metadata'],
    ['2002:7f00:1::', '6to4 loopback'],
    ['2002:a9fe:a9fe::', '6to4 metadata'],
  ])('rejects %s (%s)', address => {
    expect(isPrivateAddress(address)).toBe(true);
  });

  it.each([
    [PUBLIC_V4, 'public IPv4'],
    ['8.8.8.8', 'public IPv4'],
    ['172.32.0.1', 'just above 172.16/12'],
    ['192.169.0.1', 'just above 192.168/16'],
    ['100.128.0.1', 'just above 100.64/10'],
    [PUBLIC_V6, 'public IPv6'],
    [`::ffff:${PUBLIC_V4}`, 'IPv4-mapped public'],
  ])('accepts %s (%s)', address => {
    expect(isPrivateAddress(address)).toBe(false);
  });

  it('treats anything that is not an IP literal as private', () => {
    expect(isPrivateAddress('example.com')).toBe(true);
    expect(isPrivateAddress('')).toBe(true);
  });
});

describe('resolveSafeUrl', () => {
  it('resolves a public https URL and pins the first address', async () => {
    const target = await resolveSafeUrl('https://example.com/page', lookupReturning(PUBLIC_V4, PUBLIC_V6));

    expect(target.url.href).toBe('https://example.com/page');
    expect(target.address).toBe(PUBLIC_V4);
    expect(target.family).toBe(4);
  });

  it('assumes https for a scheme-less URL', async () => {
    const target = await resolveSafeUrl('example.com/page', lookupReturning(PUBLIC_V4));
    expect(target.url.href).toBe('https://example.com/page');
  });

  it('rejects http', async () => {
    await expect(resolveSafeUrl('http://example.com', lookupReturning(PUBLIC_V4))).rejects.toThrow(/https/);
  });

  it.each(['ftp://example.com', 'file:///etc/passwd', 'javascript:alert(1)', 'data:text/html,x', 'HTTP://example.com'])(
    'rejects scheme %s',
    async input => {
      await expect(resolveSafeUrl(input, lookupReturning(PUBLIC_V4))).rejects.toThrow(/https/);
    },
  );

  it('rejects credentials in the URL', async () => {
    await expect(resolveSafeUrl('https://user:pass@example.com', lookupReturning(PUBLIC_V4))).rejects.toThrow(
      /credentials/,
    );
  });

  it('rejects an empty host', async () => {
    await expect(resolveSafeUrl('https://', lookupReturning(PUBLIC_V4))).rejects.toThrow();
    await expect(resolveSafeUrl('', lookupReturning(PUBLIC_V4))).rejects.toThrow();
  });

  it('rejects a private IPv4 literal without consulting DNS', async () => {
    const lookup = jest.fn(lookupReturning(PUBLIC_V4));
    await expect(resolveSafeUrl('https://127.0.0.1/', lookup)).rejects.toThrow(/private/);
    expect(lookup).not.toHaveBeenCalled();
  });

  it('rejects a private IPv6 literal without consulting DNS', async () => {
    const lookup = jest.fn(lookupReturning(PUBLIC_V4));
    await expect(resolveSafeUrl('https://[::1]/', lookup)).rejects.toThrow(/private/);
    expect(lookup).not.toHaveBeenCalled();
  });

  it('rejects a public-looking hostname that resolves to a private address', async () => {
    await expect(resolveSafeUrl('https://rebind.example.com', lookupReturning('10.0.0.5'))).rejects.toThrow(/private/);
  });

  it('rejects when any resolved address is private', async () => {
    await expect(
      resolveSafeUrl('https://mixed.example.com', lookupReturning(PUBLIC_V4, '169.254.169.254')),
    ).rejects.toThrow(/private/);
  });

  it('rejects a hostname that does not resolve', async () => {
    await expect(resolveSafeUrl('https://nowhere.example.com', lookupReturning())).rejects.toThrow(/resolve/);
  });

  it('accepts a public IP literal', async () => {
    const lookup = jest.fn(lookupReturning('10.0.0.1'));
    const target = await resolveSafeUrl(`https://${PUBLIC_V4}/`, lookup);
    expect(target.address).toBe(PUBLIC_V4);
    expect(lookup).not.toHaveBeenCalled();
  });
});
