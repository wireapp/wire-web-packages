import Item from './Item';

interface Config<P> {
  comparator?: (a: Item<P>, b: Item<P>) => number,
  maxRetries?: number,
  retryDelay?: number
}

export default Config;
