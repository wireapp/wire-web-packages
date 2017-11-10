export default class Item<P> {
  fn: Function;
  priority: P;
  reject: Function;
  resolve: Function;
  retry: number;
  timestamp: number;
}
