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

import InputError from '../errors/InputError';

const TypeUtil = {
  assert_is_instance(classes: any, inst: any): void {
    if (!Array.isArray(classes)) {
      classes = [classes];
    }
    if (classes.some((_class: any) => inst instanceof _class || (inst && inst.prototype instanceof _class))) {
      return;
    }
    const valid_types = classes.map((_class: any) => `'${_class.name}'`).join(' or ');
    if (inst) {
      throw new (<any>InputError).TypeError(
        `Expected one of ${valid_types}, got '${inst.constructor.name}'.`,
        InputError.CODE.CASE_401
      );
    }
    throw new (<any>InputError).TypeError(
      `Expected one of ${valid_types}, got '${String(inst)}'.`,
      InputError.CODE.CASE_402
    );
  },

  assert_is_integer(inst: any): boolean {
    if (Number.isInteger(inst)) {
      return true;
    }
    if (inst) {
      throw new (<any>InputError).TypeError(
        `Expected integer, got '${inst.constructor.name}'.`,
        InputError.CODE.CASE_403
      );
    }
    throw new (<any>InputError).TypeError(`Expected integer, got '${String(inst)}'.`, InputError.CODE.CASE_404);
  },
};

export default TypeUtil;
