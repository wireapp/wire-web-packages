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

const Proteus = require('@wireapp/proteus');

describe('TypeUtil', () => {
  it('checks if an instance matches a specific type', () => {
    const test = () => Proteus.util.TypeUtil.assert_is_instance(Array, {});
    expect(test).toThrowError(Proteus.errors.InputError.TypeError);
  });

  it('checks if an instance matches against an array of types', () => {
    const test = () => Proteus.util.TypeUtil.assert_is_instance([Array, String], {});
    expect(test).toThrowError(Proteus.errors.InputError.TypeError);
  });

  it('recognizes string objects', () => {
    const text = new String('Hello World');
    const isInvalid = Proteus.util.TypeUtil.assert_is_instance(String, text);
    expect(isInvalid).toBeUndefined();
  });

  it('knows that string literals are not string objects', () => {
    const test = () => Proteus.util.TypeUtil.assert_is_instance(String, 'Hello World');
    expect(test).toThrowError(Proteus.errors.InputError.TypeError);
  });

  it("doesn't accept null values", () => {
    const test = () => Proteus.util.TypeUtil.assert_is_instance(String, null);
    expect(test).toThrowError(Proteus.errors.InputError.TypeError);
  });

  it('throws typed errors', () => {
    const test = () => {
      const instance = 1337;
      Proteus.util.TypeUtil.assert_is_instance(Uint8Array, instance);
    };
    expect(test).toThrowError(Proteus.errors.InputError.TypeError);
  });

  it('throws errors with error codes', () => {
    try {
      const instance = 1337;
      Proteus.util.TypeUtil.assert_is_instance(Uint8Array, instance);
    } catch (error) {
      expect(error).toEqual(jasmine.any(Proteus.errors.InputError.TypeError));
      expect(error.code).toBe(Proteus.errors.InputError.TypeError.CODE.CASE_401);
    }

    try {
      Proteus.util.TypeUtil.assert_is_integer('Hello');
    } catch (error) {
      expect(error).toEqual(jasmine.any(Proteus.errors.InputError.TypeError));
      expect(error.code).toBe(Proteus.errors.InputError.TypeError.CODE.CASE_403);
    }
  });
});
