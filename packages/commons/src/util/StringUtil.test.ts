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

import * as StringUtil from './StringUtil';

/**
 * @testEnvironment node
 */
describe('StringUtil', () => {
  describe('"capitalize"', () => {
    it('does not lowercase other characters', () => {
      const test = 'aBCD';
      const expected = 'ABCD';
      const actual = StringUtil.capitalize(test);
      expect(actual).toEqual(expected);
    });

    it('capitalizes first letter', () => {
      const test = 'abcd';
      const expected = 'Abcd';
      const actual = StringUtil.capitalize(test);
      expect(actual).toEqual(expected);
    });
  });

  describe('pluralize', () => {
    it('pluralizes the word "hour"', () => {
      const test = 'hour';
      const expected = 'hours';
      const actual = StringUtil.pluralize(test, 5);
      expect(actual).toEqual(expected);
    });

    it('pluralizes the word "bugfix"', () => {
      const test = 'bugfix';
      const expected = 'bugfixes';
      const actual = StringUtil.pluralize(test, 2, {postfix: 'es'});
      expect(actual).toEqual(expected);
    });

    it('does not pluralize if the count is 1', () => {
      const test = 'time';
      const expected = 'time';
      const actual = StringUtil.pluralize(test, 1);
      expect(actual).toEqual(expected);
    });
  });

  describe('uuidToBytes', () => {
    it('converts a UUID to bytes', () => {
      // Example taken from https://en.wikipedia.org/wiki/Universally_unique_identifier#Encoding
      const uuid = '00112233-4455-6677-8899-aabbccddeeff';
      const expected = Buffer.from([
        0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff,
      ]);
      const actual = StringUtil.uuidToBytes(uuid);
      expect(expected).toEqual(actual);
    });
  });

  describe('bytesToUUID', () => {
    it('converts a UUID to bytes', () => {
      // Example taken from https://en.wikipedia.org/wiki/Universally_unique_identifier#Encoding
      const expected = '00112233-4455-6677-8899-aabbccddeeff';
      const uuid = Buffer.from([
        0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff,
      ]);
      const actual = StringUtil.bytesToUUID(uuid);
      expect(expected).toEqual(actual);
    });
  });

  describe('serializeArgs - Browser Safe Tests', () => {
    jest.setTimeout(30000);

    test('should truncate a very large string', () => {
      const largeString = 'a'.repeat(1_000_000); // 1MB string (should truncate)

      const result = StringUtil.serializeArgs([largeString]);

      expect(result[0].length).toBeLessThanOrEqual(10_010); // Should truncate
      expect(result[0]).toContain('... [truncated]');
    });

    test('should handle circular references', () => {
      const circularObj: any = {};
      circularObj.self = circularObj; // Create circular reference

      const result = StringUtil.serializeArgs([circularObj]);

      expect(() => JSON.parse(result[0])).not.toThrow(); // Should be valid JSON
      expect(result[0]).toBeTruthy();
    });

    test('should serialize a large object safely', () => {
      const largeObject: any = {};
      for (let i = 0; i < 100_000; i++) {
        // 100k properties
        largeObject[`key${i}`] = 'value';
      }

      const result = StringUtil.serializeArgs([largeObject]);

      expect(typeof result[0]).toBe('string'); // Should still be a valid JSON string
      expect(result[0].length).toBeLessThanOrEqual(1_000_010); // Should be within the truncation limit
    });

    test('should serialize whitelisted properties correctly', () => {
      const obj = {id: '123', type: 'message', userName: 'alice', code: 'ABC'};

      const result = StringUtil.serializeArgs([obj]);

      expect(() => JSON.parse(result[0])).not.toThrow(); // Should be valid JSON
      const parsed = JSON.parse(result[0]);
      // Whitelisted properties should be preserved
      expect(parsed.id).toBe('123');
      expect(parsed.type).toBe('message');
      expect(parsed.code).toBe('ABC');
      // Non-whitelisted properties should be redacted
      expect(parsed.userName).toBe('--REDACTED--');
    });

    test('should anonymize non-whitelisted properties', () => {
      const obj = {
        id: 'user-123',
        email: 'user@example.com',
        password: 'secret',
        type: 'user',
      };

      const result = StringUtil.serializeArgs([obj]);

      expect(() => JSON.parse(result[0])).not.toThrow(); // Should be valid JSON
      const parsed = JSON.parse(result[0]);
      // Whitelisted properties preserved
      expect(parsed.id).toBe('user-123');
      expect(parsed.type).toBe('user');
      // Non-whitelisted properties redacted
      expect(parsed.email).toBe('--REDACTED--');
      expect(parsed.password).toBe('--REDACTED--');
    });

    test('should return "[Unserializable Object]" for unsupported values', () => {
      const unserializable = {
        toJSON: () => {
          throw new Error('Cannot serialize');
        },
      };

      const result = StringUtil.serializeArgs([unserializable]);

      expect(result[0]).toBe('[Unserializable Object]'); // Should return error placeholder
    });

    test('should handle nested objects with whitelisted properties', () => {
      const obj = {
        id: 'conv-1',
        conversationId: 'abc-123',
        messages: [
          {id: 'msg-1', type: 'text', content: 'Hello'},
          {id: 'msg-2', type: 'image', data: 'base64data'},
        ],
      };

      const result = StringUtil.serializeArgs([obj]);
      const parsed = JSON.parse(result[0]);

      // Top-level whitelisted properties
      expect(parsed.id).toBe('conv-1');
      expect(parsed.conversationId).toBe('abc-123');
      // Nested whitelisted properties
      expect(parsed.messages[0].id).toBe('msg-1');
      expect(parsed.messages[0].type).toBe('text');
      expect(parsed.messages[1].id).toBe('msg-2');
      expect(parsed.messages[1].type).toBe('image');
      // Non-whitelisted should be redacted
      expect(parsed.messages[0].content).toBe('--REDACTED--');
      expect(parsed.messages[1].data).toBe('--REDACTED--');
    });

    test('should redact Bearer tokens in strings', () => {
      const authHeader = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

      const result = StringUtil.serializeArgs([authHeader]);

      expect(result[0]).toContain('Bearer [REDACTED]');
      expect(result[0]).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    });

    test('should redact Bearer tokens in objects', () => {
      const obj = {
        headers: {
          Authorization: 'Bearer secret-token-12345',
          'Content-Type': 'application/json',
        },
      };

      const result = StringUtil.serializeArgs([obj]);
      const parsed = JSON.parse(result[0]);

      // Authorization header should be anonymized (not in whitelist)
      expect(parsed.headers.Authorization).toBe('--REDACTED--');
      expect(parsed.headers['Content-Type']).toBe('--REDACTED--');
      // Secret token should not appear in result
      const resultStr = result[0];
      expect(resultStr).not.toContain('secret-token-12345');
    });

    test('should handle arrays of mixed types', () => {
      const result = StringUtil.serializeArgs(['string value', 42, true, null, {id: 'obj-1', secret: 'hidden'}]);

      expect(result).toHaveLength(5);
      expect(result[0]).toBe('string value');
      expect(result[1]).toBe(42);
      expect(result[2]).toBe(true);
      expect(result[3]).toBe(null);

      const parsed = JSON.parse(result[4]);
      expect(parsed.id).toBe('obj-1');
      expect(parsed.secret).toBe('--REDACTED--');
    });

    test('should preserve whitelisted error properties', () => {
      const errorObj = {
        code: 'ERR_NETWORK',
        error: 'Connection failed',
        message: 'Network timeout occurred',
        stack: 'Error stack trace...',
      };

      const result = StringUtil.serializeArgs([errorObj]);
      const parsed = JSON.parse(result[0]);

      // Whitelisted error properties
      expect(parsed.code).toBe('ERR_NETWORK');
      expect(parsed.error).toBe('Connection failed');
      // Non-whitelisted should be redacted
      expect(parsed.message).toBe('--REDACTED--');
      expect(parsed.stack).toBe('--REDACTED--');
    });
  });
});
