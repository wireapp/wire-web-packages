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

/* eslint no-magic-numbers: "off" */

class Types {
  static readonly ARRAY = 1;
  static readonly BOOL = 2;
  static readonly BREAK = 3;
  static readonly BYTES = 4;
  static readonly FLOAT16 = 5;
  static readonly FLOAT32 = 6;
  static readonly FLOAT64 = 7;
  static readonly UINT8 = 8;
  static readonly UINT16 = 9;
  static readonly UINT32 = 10;
  static readonly UINT64 = 11;
  static readonly INT8 = 12;
  static readonly INT16 = 13;
  static readonly INT32 = 14;
  static readonly INT64 = 15;
  static readonly NULL = 16;
  static readonly OBJECT = 17;
  static readonly TAGGED = 18;
  static readonly TEXT = 19;
  static readonly UNDEFINED = 20;

  private constructor() {
    throw new Error(`Can't create instance of singleton`);
  }

  static major(type: Types): number {
    switch (type) {
      case Types.ARRAY:
        return 4;
      case Types.BOOL:
        return 7;
      case Types.BREAK:
        return 7;
      case Types.BYTES:
        return 2;
      case Types.FLOAT16:
        return 7;
      case Types.FLOAT32:
        return 7;
      case Types.FLOAT64:
        return 7;
      case Types.UINT8:
        return 0;
      case Types.UINT16:
        return 0;
      case Types.UINT32:
        return 0;
      case Types.UINT64:
        return 0;
      case Types.INT8:
        return 1;
      case Types.INT16:
        return 1;
      case Types.INT32:
        return 1;
      case Types.INT64:
        return 1;
      case Types.NULL:
        return 7;
      case Types.OBJECT:
        return 5;
      case Types.TAGGED:
        return 6;
      case Types.TEXT:
        return 3;
      case Types.UNDEFINED:
        return 7;
      default:
        throw new TypeError('Invalid CBOR type');
    }
  }
}

export default Types;
