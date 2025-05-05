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

import {SVGIcon, SVGIconProps} from './SVGIcon';

export const HashIcon = (props: SVGIconProps) => (
  <SVGIcon realWidth={16} realHeight={16} {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.84601 1.41186C7.93539 0.875604 7.57312 0.368426 7.03686 0.27905C6.5006 0.189674 5.99342 0.551943 5.90405 1.0882L5.38489 4.20313L1.8125 4.20312C1.26884 4.20312 0.828125 4.64384 0.828125 5.1875C0.828125 5.73116 1.26884 6.17188 1.8125 6.17188H5.05677L4.54114 9.26562H1.25C0.706345 9.26562 0.265625 9.70634 0.265625 10.25C0.265625 10.7937 0.706345 11.2344 1.25 11.2344H4.21302L3.65405 14.5882C3.56467 15.1245 3.92694 15.6316 4.4632 15.721C4.99946 15.8104 5.50663 15.4481 5.59601 14.9119L6.20892 11.2344L9.27552 11.2344L8.71655 14.5882C8.62717 15.1245 8.98944 15.6316 9.5257 15.721C10.062 15.8104 10.5691 15.4481 10.6585 14.9119L11.2714 11.2344H14.75C15.2937 11.2344 15.7344 10.7937 15.7344 10.25C15.7344 9.70635 15.2937 9.26563 14.75 9.26563H11.5996L12.1152 6.17188H15.3125C15.8562 6.17188 16.2969 5.73116 16.2969 5.1875C16.2969 4.64385 15.8562 4.20313 15.3125 4.20313L12.4433 4.20313L12.9085 1.41186C12.9979 0.875604 12.6356 0.368426 12.0994 0.27905C11.5631 0.189674 11.0559 0.551943 10.9665 1.0882L10.4474 4.20313L7.3808 4.20313L7.84601 1.41186ZM7.05268 6.17188L6.53705 9.26562L9.60364 9.26563L10.1193 6.17188H7.05268Z"
    />
  </SVGIcon>
);
