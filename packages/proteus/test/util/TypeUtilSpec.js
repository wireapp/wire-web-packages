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

describe('TypeUtil', () => {
  it('checks if an instance matches a specific type', () => {
    assert.throws(() => Proteus.util.TypeUtil.assert_is_instance(Array, {}));
  });

  it('checks if an instance matches against an array of types', () => {
    assert.throws(() => Proteus.util.TypeUtil.assert_is_instance([Array, String], {}));
  });

  it('recognizes string objects', () => {
    const text = new String('Hello World');
    Proteus.util.TypeUtil.assert_is_instance(String, text);
  });

  it('knows that string literals are not string objects', () => {
    const text = 'Hello World';
    assert.throws(() => Proteus.util.TypeUtil.assert_is_instance(String, text));
  });

  it("doesn't accept null values", () => {
    assert.throws(() => Proteus.util.TypeUtil.assert_is_instance(String, {}));
  });

  it('throws typed errors', () => {
    assert.throws(() => {
      const instance = 1337;
      Proteus.util.TypeUtil.assert_is_instance(Uint8Array, instance);
    }, Proteus.errors.InputError.TypeError);
  });

  it('throws errors with error codes', () => {
    try {
      const instance = 1337;
      Proteus.util.TypeUtil.assert_is_instance(Uint8Array, instance);
    } catch (error) {
      assert.instanceOf(error, Proteus.errors.InputError.TypeError);
      assert.strictEqual(error.code, Proteus.errors.InputError.TypeError.CODE.CASE_401);
    }

    try {
      Proteus.util.TypeUtil.assert_is_integer('Hello');
    } catch (error) {
      assert.instanceOf(error, Proteus.errors.InputError.TypeError);
      assert.strictEqual(error.code, Proteus.errors.InputError.TypeError.CODE.CASE_403);
    }
  });
});
