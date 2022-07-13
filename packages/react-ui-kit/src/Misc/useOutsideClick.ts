/*
 * Wire
 * Copyright (C) 2022 Wire Swiss GmbH
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

import {RefObject, useEffect} from 'react';

const useOutsideClick = (refs: RefObject<HTMLElement>[], handler: (event?: MouseEvent) => void) => {
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const isClickOutsideEveryNode = refs.every(ref => ref.current && !ref.current.contains(event.target as Node));

      if (isClickOutsideEveryNode) {
        handler(event);
      }
    };

    window.addEventListener('click', handleOutsideClick);

    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [...refs, handler]);
};

export default useOutsideClick;
