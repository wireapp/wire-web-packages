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

import {TimeInMillis} from '@wireapp/commons/lib/util/TimeUtil';

const delaysMap = new Map<string, {retryCount: number; timeoutId?: NodeJS.Timeout}>();

const defaultConfig = {
  minDelay: TimeInMillis.SECOND / 2,
  maxDelay: TimeInMillis.SECOND * 32,
  multiplyBy: 2,
  maxRetries: 10,
};

type ExponentialBackoffConfig = {
  maxDelay?: number;
  minDelay?: number;
  maxRetries?: number;
  multiplyBy?: number;
};

export function exponentialBackoff(
  key: string,
  config: ExponentialBackoffConfig = defaultConfig,
): {backOff: (onRetryLimitReached?: () => void) => Promise<void>; resetBackOff: () => void} {
  const {
    maxDelay = defaultConfig.maxDelay,
    minDelay = defaultConfig.minDelay,
    maxRetries = defaultConfig.maxRetries,
  } = config;

  const resetBackOff = () => {
    delaysMap.delete(key);
    clearTimeout(delaysMap.get(key)?.timeoutId);
  };

  return {
    backOff: async (onRetryLimitReached?: () => void) => {
      const entry = delaysMap.get(key);

      const retryCount = entry?.retryCount || 0;
      const retryTimeout = entry?.timeoutId;

      const delay = Math.pow(2, retryCount) * minDelay;
      const clampedDelay = Math.min(delay, maxDelay);

      // If we have reached the retry limit or the delay is greater than the max delay, we reset the backoff
      if (retryCount >= maxRetries || delay > maxDelay) {
        resetBackOff();
        onRetryLimitReached?.();
        return;
      }

      // If there is already a timeout running, we just wait for it to finish
      if (retryTimeout) {
        await new Promise(resolve => {
          const tid = setTimeout(resolve, clampedDelay);
          delaysMap.set(key, {retryCount, timeoutId: tid});
        });
      }

      const newRetryCount = retryCount + 1;

      // We wait for the delay to pass
      await new Promise(resolve => {
        const tid = setTimeout(resolve, clampedDelay);
        delaysMap.set(key, {retryCount: newRetryCount, timeoutId: tid});
      });

      // We reset the timeoutId and increase the retry count
      clearTimeout(delaysMap.get(key)?.timeoutId);
      delaysMap.set(key, {retryCount: newRetryCount, timeoutId: undefined});
    },

    resetBackOff,
  };
}
