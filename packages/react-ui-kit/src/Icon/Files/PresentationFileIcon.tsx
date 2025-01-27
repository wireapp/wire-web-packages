/*
 * Wire
 * Copyright (C) 2025 Wire Swiss GmbH
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

import {SVGIcon, SVGIconProps} from '../SVGIcon';

export const PresentationFileIcon = ({...props}: SVGIconProps) => {
  return (
    <SVGIcon realWidth={14} realHeight={16} fill="none" {...props}>
      <path
        d="M1 2.5C1 1.39543 1.89543 0.5 3 0.5H11C12.1046 0.5 13 1.39543 13 2.5V11.5063C13 12.1626 12.7419 12.7926 12.2815 13.2603L10.8108 14.754C10.3409 15.2312 9.69916 15.5 9.02938 15.5H3C1.89543 15.5 1 14.6046 1 13.5V2.5Z"
        fill="#F6EEE8"
        stroke="#61350D"
      />
      <path d="M13 11.5V11.5C10.7909 11.5 9 13.2909 9 15.5V15.5" stroke="#61350D" />
      <path d="M5.5 9.5L5 11" stroke="#61350D" strokeLinecap="round" />
      <path d="M8 9.5L8.5 11" stroke="#61350D" strokeLinecap="round" />
      <rect x="4" y="5" width="5.5" height="3.97059" rx="1" fill="#F6EEE8" stroke="#61350D" />
    </SVGIcon>
  );
};
