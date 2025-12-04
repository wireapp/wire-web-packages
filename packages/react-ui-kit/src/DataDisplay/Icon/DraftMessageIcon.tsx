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

export const DraftMessageIcon = (props: SVGIconProps) => (
  <SVGIcon realWidth={16} realHeight={16} {...props}>
    <path d="M3.83584 7.24738L6.10503 9.51457C6.15602 9.56552 6.25801 9.56552 6.309 9.51457L13.2951 2.5092C13.3461 2.45825 13.3461 2.35635 13.2951 2.30541L11.0259 0.0382111C10.9749 -0.012737 10.8729 -0.012737 10.8219 0.0382111L3.81034 7.04359C3.78484 7.09453 3.78484 7.19643 3.83584 7.24738Z" />
    <path d="M4.75381 10.8677L1.54124 11.9885C1.41376 12.0395 1.31177 11.9121 1.33727 11.7847L2.45912 8.575C2.48462 8.4731 2.6376 8.44763 2.71409 8.52405L4.80481 10.6129C4.90679 10.6893 4.8813 10.8167 4.75381 10.8677Z" />
    <path d="M16 14.7282V15.9453C16 15.9726 15.8867 16 15.7735 16L0.226549 15.9931C0.113274 15.9931 0 15.9658 0 15.9384V14.7213C0 14.694 0.113274 14.6666 0.226549 14.6666L15.8018 14.6666C15.8867 14.6735 16 14.7008 16 14.7282Z" />
  </SVGIcon>
);
