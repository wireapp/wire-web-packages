//
// Wire
// Copyright (C) 2018 Wire Swiss GmbH
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see http://www.gnu.org/licenses/.
//

import Config from './Config';
import Item from './Item';
import Priority from './Priority';

export default class PriorityQueue {
  private defaults = {
    comparator: (a: Item, b: Item): Priority => {
      if (a.priority === b.priority) {
        return a.timestamp - b.timestamp;
      }
      return b.priority - a.priority;
    },
    maxRetries: Infinity,
    retryDelay: 1000,
  };
  public isPending: boolean = false;
  private queue: Array<Item> = [];

  constructor(private config?: Config) {
    this.config = Object.assign(this.defaults, config);
  }

  public add(thunkedPromise: any, priority: Priority = Priority.MEDIUM): Promise<any> {
    if (typeof thunkedPromise !== 'function') {
      thunkedPromise = () => thunkedPromise;
    }

    return new Promise((resolve, reject) => {
      const queueObject = new Item();
      queueObject.fn = thunkedPromise;
      queueObject.priority = priority;
      queueObject.reject = reject;
      queueObject.resolve = resolve;
      queueObject.retry = this.config!.maxRetries;
      queueObject.timestamp = Date.now() + this.size;
      this.queue.push(queueObject);
      this.queue.sort(this.config!.comparator);
      this.run();
    });
  }

  public get all(): Array<Item> {
    return this.queue;
  }

  public get size(): number {
    return this.queue.length;
  }

  public get first(): Item {
    return this.queue[0];
  }

  public get last(): Item {
    return this.queue[this.queue.length - 1];
  }

  private resolveItems(): void {
    const queueObject = this.first;
    if (!queueObject) {
      return;
    }

    Promise.resolve(queueObject.fn())
      .then((result: any) => {
        return {shouldContinue: true, wrappedResolve: () => queueObject.resolve(result)};
      })
      .catch((error: Error) => {
        if (queueObject.retry! > 0) {
          queueObject.retry! -= 1;
          // TODO: Implement configurable reconnection delay (and reconnection delay growth factor)
          setTimeout(() => this.resolveItems(), this.config!.retryDelay || 1000);
          return {shouldContinue: false};
        } else {
          queueObject.reject(error);
          return {shouldContinue: true};
        }
      })
      .then(({shouldContinue, wrappedResolve}: {shouldContinue: boolean; wrappedResolve?: Function}) => {
        if (shouldContinue) {
          if (wrappedResolve) {
            wrappedResolve();
          }
          this.isPending = false;
          const nextItem: Item | undefined = this.queue.shift();
          if (nextItem) {
            this.resolveItems();
          }
        }
      });
  }

  private run(): void {
    if (!this.isPending && this.first) {
      this.isPending = true;
      this.resolveItems();
    }
  }

  public toString(): string {
    return this.queue
      .map((item: Item, index: number) => {
        return `"${index}": ${item.fn.toString().replace(/(\r\n|\n|\r|\s+)/gm, '')}`;
      })
      .join('\r\n');
  }
}
