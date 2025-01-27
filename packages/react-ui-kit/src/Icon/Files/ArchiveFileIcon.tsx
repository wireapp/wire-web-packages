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

export const ArchiveFileIcon = ({...props}: SVGIconProps) => {
  return (
    <SVGIcon realWidth={14} realHeight={16} fill="none" {...props}>
      <path
        d="M0.995605 2.5C0.995605 1.39543 1.89104 0.5 2.99561 0.5H10.9956C12.1002 0.5 12.9956 1.39543 12.9956 2.5V11.5063C12.9956 12.1626 12.7375 12.7926 12.2771 13.2603L10.8065 14.754C10.3365 15.2312 9.69477 15.5 9.02498 15.5H2.99561C1.89104 15.5 0.995605 14.6046 0.995605 13.5V2.5Z"
        fill="#F6EEE8"
        stroke="#61350D"
      />
      <path d="M12.9956 11.5V11.5C10.7865 11.5 8.99561 13.2909 8.99561 15.5V15.5" stroke="#61350D" />
      <path
        d="M3.49561 8.5C3.49561 8.77614 3.71946 9 3.99561 9C4.27175 9 4.49561 8.77614 4.49561 8.5L3.49561 8.5ZM3.49561 0.5L3.49561 8.5L4.49561 8.5L4.49561 0.5L3.49561 0.5Z"
        fill="#61350D"
      />
      <path d="M5.49561 2L4.49561 2" stroke="#61350D" strokeLinecap="round" />
      <path d="M3.49561 3L2.49561 3" stroke="#61350D" strokeLinecap="round" />
      <path d="M5.49561 4L4.49561 4" stroke="#61350D" strokeLinecap="round" />
      <path d="M3.49561 5L2.49561 5" stroke="#61350D" strokeLinecap="round" />
      <path d="M5.49561 6L4.49561 6" stroke="#61350D" strokeLinecap="round" />
      <path d="M3.49561 7L2.49561 7" stroke="#61350D" strokeLinecap="round" />
    </SVGIcon>
  );
};
