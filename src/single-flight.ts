/**
 * Collapses concurrent calls for the same key into one: while a call for a
 * key is in flight, later callers get the same promise instead of starting
 * the work again. Once it settles (resolved or rejected) the key is released,
 * so a later call starts fresh — a failure is never cached here.
 */
export class SingleFlight<T> {
  private inFlight: Map<string, Promise<T>> = new Map();

  run(key: string, work: () => Promise<T>): Promise<T> {
    const existing = this.inFlight.get(key);
    if (existing) {
      return existing;
    }
    const promise = (async () => {
      try {
        return await work();
      } finally {
        this.inFlight.delete(key);
      }
    })();
    this.inFlight.set(key, promise);
    return promise;
  }
}
