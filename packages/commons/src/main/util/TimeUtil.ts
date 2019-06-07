/*
 * Wire
 * Copyright (C) 2019 Wire Swiss GmbH
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

export enum TimeInMillis {
  SECOND = 1000,
  MINUTE = SECOND * 60,
  HOUR = MINUTE * 60,
  DAY = HOUR * 24,
  WEEK = DAY * 7,
  YEAR = DAY * 365,
}

export enum TimeUnits {
  ONE_SECOND_IN_MILLIS = 1000,
  ONE_MINUTE_IN_MILLIS = ONE_SECOND_IN_MILLIS * 60,
  ONE_HOUR_IN_MILLIS = ONE_MINUTE_IN_MILLIS * 60,
  ONE_DAY_IN_MILLIS = ONE_DAY_IN_MILLIS * 24,
  ONE_WEEK_IN_MILLIS = ONE_WEEK_IN_MILLIS * 7,
  ONE_YEAR_IN_MILLIS = ONE_YEAR_IN_MILLIS * 365,
}
