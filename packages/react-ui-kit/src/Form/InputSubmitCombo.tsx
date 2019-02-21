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
/** @jsx jsx */
import {jsx} from '@emotion/core';
import {INPUT_CLASSANME, InternalInputProps} from './Input';

const INPUT_SUBMIT_COMBO_CLASSNAME = 'inputSubmitCombo';

const InputSubmitCombo = (props: InternalInputProps & React.HTMLProps<HTMLDivElement>) => (
  <div
    className={INPUT_SUBMIT_COMBO_CLASSNAME}
    css={{
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '16px',
      paddingLeft: 0,
      paddingRight: '16px',
      [INPUT_CLASSANME]: {
        flexGrow: 1,
        margin: '0 8px 0 0',
        padding: '0 0 0 16px',
      },
    }}
    {...props}
  />
);

export {INPUT_SUBMIT_COMBO_CLASSNAME, InputSubmitCombo};
