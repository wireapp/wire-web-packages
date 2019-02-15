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

import styled from '@emotion/styled';
import {COLOR} from '../Identity';

export interface RoundContainerProps {
  color?: string;
  size?: number;
}

const RoundContainer = styled.div<RoundContainerProps>`
  width: ${props => parseFloat(props.size.toString())}px;
  height: ${props => parseFloat(props.size.toString())}px;
  border-radius: 50%;
  border: none;
  background-color: ${props => props.color};
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
`;

RoundContainer.defaultProps = {
  color: COLOR.BLUE,
  size: 72,
};

export {RoundContainer};
