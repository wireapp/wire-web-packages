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

export const ImageFileIcon = ({...props}: SVGIconProps) => {
  return (
    <SVGIcon realWidth={14} realHeight={16} {...props} fill="none">
      <path
        d="M0.995605 2.5C0.995605 1.39543 1.89104 0.5 2.99561 0.5H10.9956C12.1002 0.5 12.9956 1.39543 12.9956 2.5V11.5063C12.9956 12.1626 12.7375 12.7926 12.2771 13.2603L10.8065 14.754C10.3365 15.2312 9.69477 15.5 9.02498 15.5H2.99561C1.89104 15.5 0.995605 14.6046 0.995605 13.5V2.5Z"
        fill="#E5F1F3"
        stroke="#014352"
      />
      <path d="M12.9956 11.5V11.5C10.7865 11.5 8.99561 13.2909 8.99561 15.5V15.5" stroke="#014352" />
      <circle cx="6.49561" cy="4.5" r="1" fill="#E5F1F3" stroke="#014352" />
      <path d="M6.33054 10.25L8.49561 6.5L10.6607 10.25H6.33054Z" fill="#E5F1F3" stroke="#014352" />
      <path d="M3.69657 10.25L4.99561 8L6.29464 10.25H3.69657Z" fill="#E5F1F3" stroke="#014352" />
    </SVGIcon>
  );
};
