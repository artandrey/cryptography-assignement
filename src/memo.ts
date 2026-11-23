export function memo<T extends unknown[], R>(
  fn: (...args: T) => R,
): (...args: T) => R {
  type CacheNode = {
    next: Map<unknown, CacheNode>;
    result?: { value: R };
  };

  const cache: CacheNode = { next: new Map() };

  return (...args: T): R => {
    let node = cache;

    for (const arg of args) {
      let next = node.next.get(arg);

      if (next === undefined) {
        next = { next: new Map() };
        node.next.set(arg, next);
      }

      node = next;
    }

    if (node.result !== undefined) {
      return node.result.value;
    }

    const value = fn(...args);
    node.result = { value };

    return value;
  };
}
