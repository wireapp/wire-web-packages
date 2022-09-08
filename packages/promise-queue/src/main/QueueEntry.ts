/*
 * Wire
 * Copyright (C) 2022 Wire Swiss GmbH
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

export type PromiseFn<T> = (...args: any[]) => Promise<T>;
export type PromiseResolveFn = (value?: any) => void;
export type PromiseRejectFn = (reason?: any) => void;

export interface QueueEntry<T> {
  fn: PromiseFn<T>;
  rejectFn: PromiseRejectFn;
  resolveFn?: PromiseResolveFn;
}
