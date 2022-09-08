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

import logdown from 'logdown';
import {TimeUtil} from '@wireapp/commons';
import {PromiseQueueOptions} from './PromiseQueueOptions';
import {QueueEntry, PromiseFn} from './QueueEntry';

export class PromiseQueue {
  private blocked: boolean;
  private runningTasks: number;
  private interval?: number;
  private paused: boolean;
  private readonly concurrent: number;
  private readonly logger: logdown.Logger;
  private readonly queue: QueueEntry<any>[];
  private readonly timeout: number;

  static get CONFIG() {
    return {
      UNBLOCK_INTERVAL: TimeUtil.TimeInMillis.MINUTE,
    };
  }

  constructor(options?: PromiseQueueOptions) {
    const loggerName = `PromiseQueue`;
    this.logger = logdown(loggerName, {
      logger: console,
      markdown: false,
    });

    this.blocked = false;
    this.concurrent = options!.concurrent ?? 1;
    this.runningTasks = 0;
    this.interval = undefined;
    this.paused = options!.paused ?? false;
    this.queue = [];
    this.timeout = options!.timeout ?? PromiseQueue.CONFIG.UNBLOCK_INTERVAL;
  }

  /**
   * Executes first function in the queue.
   */
  execute(): void {
    if (this.paused || this.blocked) {
      return;
    }

    const queueEntry = this.queue.shift();
    if (!queueEntry) {
      return;
    }

    this.runningTasks++;

    if (this.runningTasks >= this.concurrent) {
      this.blocked = true;
    }

    this.interval = window.setInterval(() => {
      if (!this.paused) {
        const logObject = {pendingEntry: queueEntry, queueState: this.queue};
        this.logger.warn(`Promise queue timed-out after ${this.timeout}ms, unblocking queue`, logObject);
        this.resume();
      }
    }, this.timeout);

    queueEntry
      .fn()
      .then(response => {
        queueEntry.resolveFn(response);
      })
      .catch(error => {
        queueEntry.resolveFn = () => {};
        queueEntry.rejectFn(error);
      })
      .finally(() => {
        this.clearInterval();

        this.runningTasks--;

        if (this.runningTasks < this.concurrent) {
          this.blocked = false;
        }

        this.execute();
      });
  }

  /**
   * Get the number of queued functions.
   * @returns Number of queued functions
   */
  getLength(): number {
    return this.queue.length;
  }

  /**
   * Pause or resume the execution.
   */
  pause(shouldPause: boolean = true): PromiseQueue {
    this.paused = shouldPause;

    if (!this.paused) {
      this.execute();
    }

    return this;
  }

  /**
   * Queued function is executed when queue is empty or previous functions are executed.
   * @param fn Function to be executed in queue order
   * @returns Resolves when function was executed
   */
  push<T>(fn: PromiseFn<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const queueEntry: QueueEntry<T> = {
        fn,
        rejectFn: reject,
        resolveFn: resolve,
      };

      this.queue.push(queueEntry);
      this.execute();
    });
  }

  /**
   * Resume execution of queue.
   */
  private resume(): void {
    this.clearInterval();
    this.blocked = false;
    this.pause(false);
  }

  /**
   * Queued function is executed.
   * @param fn Function to be executed in queue order
   * @returns Resolves when function was executed
   */
  unshift<T>(fn: PromiseFn<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const queueEntry = {
        fn: fn,
        rejectFn: reject,
        resolveFn: resolve,
      };

      this.queue.unshift(queueEntry);
      this.execute();
    });
  }

  private clearInterval(): void {
    if (this.interval) {
      window.clearInterval(this.interval);
      this.interval = undefined;
    }
  }
}
