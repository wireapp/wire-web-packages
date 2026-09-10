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

import * as dns from 'dns';
import * as net from 'net';

export interface ResolvedAddress {
  address: string;
  family: number;
}

export type LookupFunction = (hostname: string) => Promise<ResolvedAddress[]>;

export interface SafeTarget {
  url: URL;
  address: string;
  family: number;
}

const defaultLookup: LookupFunction = hostname => dns.promises.lookup(hostname, {all: true, verbatim: true});

// [network, prefix length] in IPv4 dotted form; anything not globally routable
const PRIVATE_V4_RANGES: Array<[string, number]> = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.88.99.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
];

function parseIPv4(address: string): number | undefined {
  if (!net.isIPv4(address)) {
    return undefined;
  }
  return address.split('.').reduce((acc, octet) => ((acc << 8) | Number(octet)) >>> 0, 0);
}

function inRangeV4(value: number, network: string, prefixLength: number): boolean {
  const mask = prefixLength === 0 ? 0 : (0xffffffff << (32 - prefixLength)) >>> 0;
  return (value & mask) >>> 0 === (parseIPv4(network)! & mask) >>> 0;
}

function isPrivateIPv4(value: number): boolean {
  return PRIVATE_V4_RANGES.some(([network, prefixLength]) => inRangeV4(value, network, prefixLength));
}

/** Expand an IPv6 address into eight 16-bit groups */
function parseIPv6(address: string): number[] | undefined {
  const withoutZone = address.split('%')[0];
  if (!net.isIPv6(withoutZone)) {
    return undefined;
  }

  const toGroups = (part: string): number[] => {
    if (!part) {
      return [];
    }
    const groups = part.split(':');
    const last = groups[groups.length - 1];
    if (last.includes('.')) {
      const embedded = parseIPv4(last);
      if (embedded === undefined) {
        return [];
      }
      groups.splice(-1, 1, (embedded >>> 16).toString(16), (embedded & 0xffff).toString(16));
    }
    return groups.map(group => parseInt(group, 16));
  };

  const [head, tail] = withoutZone.split('::');
  const headGroups = toGroups(head);
  const tailGroups = tail === undefined ? [] : toGroups(tail);
  const padding = new Array(Math.max(0, 8 - headGroups.length - tailGroups.length)).fill(0);
  const groups = [...headGroups, ...padding, ...tailGroups];

  return groups.length === 8 ? groups : undefined;
}

function embeddedIPv4(groups: number[], offset: number): number {
  return ((groups[offset] << 16) | groups[offset + 1]) >>> 0;
}

function isPrivateIPv6(groups: number[]): boolean {
  const leadingZeros = groups.slice(0, 5).every(group => group === 0);

  if (leadingZeros && groups[5] === 0) {
    // ::, ::1 and the deprecated IPv4-compatible ::a.b.c.d form
    return groups[6] === 0 ? true : isPrivateIPv4(embeddedIPv4(groups, 6));
  }
  if (leadingZeros && groups[5] === 0xffff) {
    // IPv4-mapped ::ffff:a.b.c.d
    return isPrivateIPv4(embeddedIPv4(groups, 6));
  }
  if (groups[0] === 0x64 && groups[1] === 0xff9b && groups.slice(2, 6).every(group => group === 0)) {
    // NAT64 64:ff9b::/96
    return isPrivateIPv4(embeddedIPv4(groups, 6));
  }
  if (groups[0] === 0x2002) {
    // 6to4 2002::/16
    return isPrivateIPv4(embeddedIPv4(groups, 1));
  }
  if (groups[0] === 0x2001 && groups[1] === 0x0db8) {
    // documentation 2001:db8::/32
    return true;
  }
  if (groups[0] === 0x100 && groups.slice(1, 4).every(group => group === 0)) {
    // discard-only 100::/64
    return true;
  }

  const isUniqueLocal = (groups[0] & 0xfe00) === 0xfc00;
  const isLinkLocal = (groups[0] & 0xffc0) === 0xfe80;
  const isMulticast = (groups[0] & 0xff00) === 0xff00;

  return isUniqueLocal || isLinkLocal || isMulticast;
}

/**
 * Returns true for loopback, private, link-local, multicast, reserved and otherwise
 * non-routable addresses, including IPv4 addresses embedded in IPv6 forms.
 * Anything that is not a valid IP literal is treated as private.
 */
export function isPrivateAddress(address: string): boolean {
  const v4 = parseIPv4(address);
  if (v4 !== undefined) {
    return isPrivateIPv4(v4);
  }

  const v6 = parseIPv6(address);
  if (v6 !== undefined) {
    return isPrivateIPv6(v6);
  }

  return true;
}

const SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:/i;

/**
 * Validates that a URL is https, carries no credentials and points at a publicly routable
 * address. The hostname is resolved here so the caller can pin the connection to the
 * address that was checked, which closes the DNS rebinding window.
 */
export async function resolveSafeUrl(input: string, lookup: LookupFunction = defaultLookup): Promise<SafeTarget> {
  const trimmed = (input ?? '').trim();
  if (!trimmed) {
    throw new Error('URL must not be empty');
  }

  const candidate = SCHEME_PATTERN.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(candidate);

  if (url.protocol !== 'https:') {
    throw new Error('Only https URLs are allowed');
  }
  if (url.username || url.password) {
    throw new Error('URLs with credentials are not allowed');
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, '');
  if (!hostname) {
    throw new Error('URL must have a host');
  }

  if (net.isIP(hostname)) {
    if (isPrivateAddress(hostname)) {
      throw new Error(`"${hostname}" is a private or reserved address`);
    }
    return {url, address: hostname, family: net.isIP(hostname)};
  }

  const addresses = await lookup(hostname);
  if (!addresses.length) {
    throw new Error(`Could not resolve "${hostname}"`);
  }

  const offending = addresses.find(({address}) => isPrivateAddress(address));
  if (offending) {
    throw new Error(`"${hostname}" resolves to a private or reserved address`);
  }

  return {url, address: addresses[0].address, family: addresses[0].family};
}
