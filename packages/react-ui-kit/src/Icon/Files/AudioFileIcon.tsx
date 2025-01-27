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

export const AudioFileIcon = ({...props}: SVGIconProps) => {
  return (
    <SVGIcon realWidth={14} realHeight={16} {...props} fill="none">
      <path
        d="M1 2.5C1 1.39543 1.89543 0.5 3 0.5H11C12.1046 0.5 13 1.39543 13 2.5V11.5063C13 12.1626 12.7419 12.7926 12.2815 13.2603L10.8108 14.754C10.3409 15.2312 9.69916 15.5 9.02938 15.5H3C1.89543 15.5 1 14.6046 1 13.5V2.5Z"
        fill="#F4EDF7"
        stroke="#835699"
      />
      <path d="M13 11.5V11.5C10.7909 11.5 9 13.2909 9 15.5V15.5" stroke="#835699" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.5 4.5C5.77614 4.5 6 4.72386 6 5L6 9.5C6 9.77614 5.77614 10 5.5 10C5.22386 10 5 9.77614 5 9.5L5 5C5 4.72386 5.22386 4.5 5.5 4.5Z"
        fill="#835699"
      />
      <circle cx="4.5" cy="9.5" r="1" stroke="#835699" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.5 3.5C9.77614 3.5 10 3.72386 10 4L10 8.5C10 8.77614 9.77614 9 9.5 9C9.22386 9 9 8.77614 9 8.5L9 4C9 3.72386 9.22386 3.5 9.5 3.5Z"
        fill="#835699"
      />
      <circle cx="8.5" cy="8.5" r="1" stroke="#835699" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.98518 3.8787C10.0522 4.1466 9.88927 4.41806 9.62137 4.48504L5.62137 5.48504C5.35348 5.55201 5.08201 5.38913 5.01504 5.12123C4.94806 4.85334 5.11094 4.58187 5.37884 4.51489L9.37884 3.51489C9.64674 3.44792 9.9182 3.6108 9.98518 3.8787Z"
        fill="#835699"
      />
    </SVGIcon>
  );
};
