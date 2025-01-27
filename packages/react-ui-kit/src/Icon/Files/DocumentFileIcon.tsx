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

export const DocumentFileIcon = ({...props}: SVGIconProps) => {
  return (
    <SVGIcon realWidth={14} realHeight={16} fill="none" {...props}>
      <path
        d="M0.998901 2.49811C0.998901 1.39378 1.89414 0.498535 2.99848 0.498535H10.9971C12.1015 0.498535 12.9967 1.39378 12.9967 2.49811V11.5029C12.9967 12.1591 12.7387 12.7889 12.2783 13.2565L10.8079 14.7499C10.3381 15.2271 9.69648 15.4958 9.02683 15.4958H2.99848C1.89414 15.4958 0.998901 14.6006 0.998901 13.4962V2.49811Z"
        fill="var(--document-file-icon-bg)"
        stroke="var(--document-file-icon-stroke)"
      />
      <path d="M4.49817 4.99854H9.49732" stroke="var(--document-file-icon-stroke)" strokeLinecap="round" />
      <path d="M4.49817 6.99805H9.49732" stroke="var(--document-file-icon-stroke)" strokeLinecap="round" />
      <path d="M4.49817 8.99756H7.99758" stroke="var(--document-file-icon-stroke)" strokeLinecap="round" />
      <path
        d="M12.9969 11.4971V11.4971C10.7881 11.4971 8.99756 13.2876 8.99756 15.4964V15.4964"
        stroke="var(--document-file-icon-stroke)"
      />
    </SVGIcon>
  );
};
