/*
 * Wire
 * Copyright (C) 2016 Wire Swiss GmbH
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

'use strict';

const ProteusError = require('../errors/ProteusError');
const TypeUtil = require('../util/TypeUtil');

/** @module util */

/**
 * Concatenates array buffers (usually 8-bit unsigned).
 */
const ArrayUtil = {
  /**
   * @param {!Array<ArrayBuffer>} buffers
   * @returns {Array<ArrayBuffer>}
   */
  concatenate_array_buffers(buffers) {
    TypeUtil.assert_is_instance(Array, buffers);

    return buffers.reduce((a, b) => {
      const buf = new a.constructor(a.byteLength + b.byteLength);
      buf.set(a, 0);
      buf.set(b, a.byteLength);
      return buf;
    });
  },

  /**
   * @param {!(Array<number>|Uint8Array)} array
   * @returns {void}
   * @throws {errors.ProteusError}
   */
  assert_is_not_zeros(array) {
    let only_zeroes = true;
    for (let val in array) {
      if (val > 0) {
        only_zeroes = false;
        break;
      }
    }

    if (only_zeroes === true) {
      throw new ProteusError('Array consists only of zeroes.', ProteusError.prototype.CODE.CASE_100);
    }
  },
};

module.exports = ArrayUtil;
