/*
 * Wire
 * Copyright (C) 2024 Wire Swiss GmbH
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

export const NumberedListIcon = (props: SVGIconProps) => (
  <SVGIcon realWidth={16} realHeight={16} {...props}>
    <path d="M5 7H15V9H5V7ZM5 1H15V3H5V1ZM5 13H15V15H5V13ZM1.604 4V1.28516H1.55762L0.708008 1.85889V1.0874L1.604 0.477051H2.5V4H1.604ZM0.770508 7.25439C0.770508 6.55371 1.31738 6.08008 2.13525 6.08008C2.92383 6.08008 3.45117 6.50244 3.45117 7.125C3.45117 7.51562 3.22168 7.8623 2.59668 8.41895L2.01562 8.95361V9H3.5V9.69824H0.821777V9.1001L1.93506 8.05273C2.45264 7.57422 2.58447 7.396 2.58447 7.18848C2.58447 6.92969 2.39404 6.75635 2.10352 6.75635C1.80078 6.75635 1.59082 6.96143 1.59082 7.25195V7.26904H0.770508V7.25439ZM1.60791 13.9946V13.377H2.04004C2.34033 13.377 2.53809 13.2085 2.53809 12.9521C2.53809 12.6958 2.34521 12.5371 2.03271 12.5371C1.7251 12.5371 1.51758 12.7202 1.50781 12.9961H0.694824C0.707031 12.3076 1.23438 11.8682 2.05225 11.8682C2.8335 11.8682 3.37061 12.2612 3.37061 12.8301C3.37061 13.2354 3.09961 13.5552 2.7041 13.6284V13.6748C3.18994 13.7261 3.5 14.0459 3.5 14.5C3.5 15.1372 2.89941 15.5815 2.0376 15.5815C1.21484 15.5815 0.660645 15.1323 0.628906 14.4414H1.4834C1.49561 14.71 1.71289 14.876 2.05225 14.876C2.36963 14.876 2.58936 14.6953 2.58936 14.4316C2.58936 14.1606 2.38184 13.9946 2.04004 13.9946H1.60791Z" />
  </SVGIcon>
);