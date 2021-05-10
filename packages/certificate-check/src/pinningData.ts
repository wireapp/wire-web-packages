/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
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

export interface PublicKeyInfoData {
  algorithmID: string;
  algorithmParam: string | null;
  fingerprints: string[];
}

export interface PinningData {
  publicKeyInfo: PublicKeyInfoData[];
  issuerRootPubkeys?: string[];
  url: RegExp;
}

export const WILDCARD_CERT_FINGERPRINT: string = '3pHQns2wdYtN4b2MWsMguGw70gISyhBZLZDpbj+EmdU=';
export const MULTIDOMAIN_CERT_FINGERPRINT: string = 'bORoZ2vRsPJ4WBsUdL1h3Q7C50ZaBqPwngDmDVw+wHA=';
export const CERT_ALGORITHM_RSA: string = '2a864886f70d010101';
export const PUBLIC_KEY_VERISIGN_CLASS3_G5_ROOT: string =
  '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAryQICCl6NZ5gDKrnSztO\n3Hy8PEUcuyvg/ikC+VcIo2SFFSf18a3IMYldIugqqqZCs4/4uVW3sbdLs/6PfgdX\n7O9D22ZiFWHPYA2k2N744MNiCD1UE+tJyllUhSblK48bn+v1oZHCM0nYQ2NqUkvS\nj+hwUU3RiWl7x3D2s9wSdNt7XUtW05a/FXehsPSiJfKvHJJnGOX0BgTvkLnkAOTd\nOrUZ/wK69Dzu4IvrN4vs9Nes8vbwPa/ddZEzGR0cQMt0JBkhk9kU/qwqUseP1QRJ\n5I1jR4g8aYPL/ke9K35PxZWuDp3U0UPAZ3PjFAh+5T+fc7gzCs9dPzSHloruU+gl\nFQIDAQAB\n-----END PUBLIC KEY-----\n';
export const PINS: PinningData[] = [
  {
    publicKeyInfo: [
      {
        algorithmID: CERT_ALGORITHM_RSA,
        algorithmParam: null,
        fingerprints: [MULTIDOMAIN_CERT_FINGERPRINT, WILDCARD_CERT_FINGERPRINT],
      },
    ],
    url: /^app\.wire\.com$/i,
  },
  {
    publicKeyInfo: [
      {
        algorithmID: CERT_ALGORITHM_RSA,
        algorithmParam: null,
        fingerprints: [MULTIDOMAIN_CERT_FINGERPRINT, WILDCARD_CERT_FINGERPRINT],
      },
    ],
    url: /^(www\.)?wire\.com$/i,
  },
  {
    publicKeyInfo: [
      {
        algorithmID: CERT_ALGORITHM_RSA,
        algorithmParam: null,
        fingerprints: [WILDCARD_CERT_FINGERPRINT],
      },
    ],
    url: /^prod-(assets|nginz-https|nginz-ssl)\.wire\.com$/i,
  },
  {
    issuerRootPubkeys: [PUBLIC_KEY_VERISIGN_CLASS3_G5_ROOT],
    publicKeyInfo: [],
    url: /^[a-z0-9]{14,63}\.cloudfront\.net$/i,
  },
];
