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

import {Text} from './Text';
import media from '../mediaQueries';

const Paragraph = Text.withComponent('p').extend`
  margin-top: 0;
  margin-bottom: 16px;
`;

Paragraph.defaultProps = {
  ...Paragraph.defaultProps,
  block: true,
};

const Lead = Text.withComponent('p').extend`
  margin-bottom: 56px;
  margin-top: 0;
  ${media.mobile`
    font-size: 20px;
  `};
`;

Lead.defaultProps = {
  block: true,
  center: true,
  fontSize: '24px',
};

export {Paragraph, Lead};
