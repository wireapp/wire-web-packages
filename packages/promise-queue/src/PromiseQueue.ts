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

import {PromiseQueueOptions} from './PromiseQueueOptions';
import {QueueEntry, Task} from './QueueEntry';

const defaultOptions = {
  timeout: 1000 * 60, // 1 minute
  concurrent: 1,
  paused: false,
  delay: 0,
};

export class PromiseQueue {
  private blocked: boolean;
  private runningTasks: number;
  private interval?: NodeJS.Timeout;
  private paused: boolean;
  private readonly concurrent: number;
  private readonly logger?: {warn: (...args: any[]) => void};
  private readonly queue: QueueEntry<any>[];
  private readonly timeout: number;
  private delay: number;

  constructor(options?: PromiseQueueOptions) {
    this.blocked = false;
    this.concurrent = options?.concurrent ?? defaultOptions.concurrent;
    this.runningTasks = 0;
    this.interval = undefined;
    this.paused = options?.paused ?? defaultOptions.paused;
    this.queue = [];
    this.timeout = options?.timeout ?? defaultOptions.timeout;
    this.delay = options?.delay ?? defaultOptions.delay;
  }

  /**
   * Executes first function in the queue.
   */
  private execute(): void {
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

    this.interval = setInterval(() => {
      if (!this.paused) {
        const logObject = {pendingEntry: queueEntry, queueState: this.queue};
        this.logger?.warn(`Promise queue timed-out after ${this.timeout}ms, unblocking queue`, logObject);
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

        if (this.delay) {
          setTimeout(() => this.execute(), this.delay);
        } else {
          this.execute();
        }
      });
  }

  hasRunningTasks(): boolean {
    return this.runningTasks > 0;
  }

  /**
   * Get the number of queued functions.
   * @returns Number of queued functions
   */
  getLength(): number {
    return this.queue.length;
  }

  setDelay(delay: number) {
    this.delay = delay;
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

  isPaused(): boolean {
    return this.paused;
  }

  /**
   * Queued function is executed when queue is empty or previous functions are executed.
   * @param fn Function to be executed in queue order
   * @returns Resolves when function was executed
   */
  push<T>(fn: Task<T>): Promise<T> {
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

  private clearInterval(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  /**
   * Flushes the queue by removing all pending tasks without executing them.
   * All flushed promises are rejected with the provided reason.
   *
   * Running tasks are unaffected.
   */
  flush(reason: Error = new Error('Queue was flushed')): void {
    while (this.queue.length > 0) {
      const entry = this.queue.shift();
      if (entry) {
        // Prevent accidental resolve if the task ever runs
        entry.resolveFn = () => {};
        entry.rejectFn(reason);
      }
    }
  }
}
