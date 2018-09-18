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

export interface NodeMap<T> {
  [index: string]: Node<T>;
}

export interface Node<T> {
  key: string;
  value: T;
  next: Node<T> | null;
  previous: Node<T> | null;
}

class LRUCache<T> {
  private map: NodeMap<T>;
  private head: Node<T> | null;
  private end: Node<T> | null;

  constructor(private readonly capacity: number = 100) {
    this.map = {};
    this.head = null;
    this.end = null;
  }

  public delete(key: string): boolean {
    const node = this.map[key];

    if (node) {
      this.remove(node);
      delete this.map[node.key];
      return true;
    }

    return false;
  }

  public deleteAll(): void {
    this.map = {};
    this.head = null;
    this.end = null;
  }

  public get(key: string): T | undefined {
    const node = this.map[key];

    if (node) {
      this.remove(node);
      this.setHead(node);
      return node.value;
    }

    return undefined;
  }

  public getAll(): {[id: string]: T} {
    return Object.keys(this.map).reduce((accumulator: {[id: string]: T}, id) => {
      const node = this.map[id];
      accumulator[id] = node.value;
      return accumulator;
    }, {});
  }

  public keys(): string[] {
    const keys: string[] = [];
    let entry = this.head;

    while (entry) {
      keys.push(entry.key);
      entry = entry.next;
    }

    return keys;
  }

  public latest(): T | null {
    if (this.head) {
      return this.head.value;
    }
    return null;
  }

  public oldest(): T | null {
    if (this.end) {
      return this.end.value;
    }
    return null;
  }

  private remove(node: Node<T>): Node<T> {
    if (node.previous) {
      node.previous.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next !== null) {
      node.next.previous = node.previous;
    } else {
      this.end = node.previous;
    }

    return node;
  }

  public set(key: string, value: T): T | undefined {
    const matchedNode = this.map[key];
    let removedNode;

    if (matchedNode) {
      const removedValue = matchedNode.value;
      matchedNode.value = value;
      this.remove(matchedNode);
      this.setHead(matchedNode);
      return removedValue;
    } else {
      const created: Node<T> = {
        key,
        next: null,
        previous: null,
        value,
      };

      const isOverCapacity = this.size() >= this.capacity;
      if (isOverCapacity) {
        if (this.end) {
          delete this.map[this.end.key];
          removedNode = this.remove(this.end);
        }
      }

      if (this.capacity > 0) {
        this.setHead(created);
        this.map[key] = created;
      }

      if (removedNode) {
        return removedNode.value;
      }
    }

    return undefined;
  }

  private setHead(node: Node<T>): void {
    node.next = this.head;
    node.previous = null;

    if (this.head) {
      this.head.previous = node;
    }

    this.head = node;

    if (!this.end) {
      this.end = this.head;
    }
  }

  public size(): number {
    return Object.keys(this.map).length;
  }

  public toString(): string {
    let string = '(newest) ';
    let entry = this.head;

    while (entry) {
      string += `${String(entry.key)}:${entry.value}`;
      entry = entry.next;
      if (entry) {
        string += ' > ';
      }
    }

    return `${string} (oldest)`;
  }

  public [Symbol.iterator]() {
    let node = this.head;
    return {
      next: () => {
        if (node) {
          const obj = {done: false, value: [node.key, node.value]};
          node = node.next;
          return obj;
        } else {
          node = this.head;
          return {done: true};
        }
      },
    };
  }
}

export {LRUCache};
