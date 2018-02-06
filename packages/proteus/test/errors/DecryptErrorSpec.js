/*
 * Wire
 * Copyright (C) 2017 Wire Swiss GmbH
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

describe('DecryptError', () => {
  describe('constructor', () => {
    it('constructs a default error code', () => {
      const correct_error_code = 2;

      let error = new Proteus.errors.DecryptError.InvalidMessage();
      assert(error.code === correct_error_code);

      error = new Proteus.errors.DecryptError.InvalidMessage('Custom Text');
      assert(error.code === correct_error_code);
    });
  });

  describe('Wire for web compatibility', () => {
    const error_code = 300;
    const error_message = 'The received message was too big.';

    it('uses the generic error class as namespace', () => {
      const error = new Proteus.errors.DecryptError.InvalidMessage(error_message, error_code);
      assert(error.code === error_code);
      assert(error.message === error_message);
    });

    it('assures that specializations are the same type as generics', () => {
      const error = new Proteus.errors.DecryptError.InvalidMessage(error_message, error_code);
      assert.instanceOf(error, Proteus.errors.DecryptError.InvalidMessage);
      assert.instanceOf(error, Proteus.errors.DecryptError);
    });

    it('is possible to create an error from a generic class', () => {
      const error = new Proteus.errors.DecryptError();
      assert.isDefined(error);
      assert.isDefined(error.message);
    });
  });
});
