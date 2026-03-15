export class AsyncQueue<T> {
  private buffer: T[] = [];

  private waiting: ((value: IteratorResult<T>) => void) | null = null;

  private done = false;

  push(item: { value: T }): void {
    if (this.waiting) {
      this.waiting({ value: item.value, done: false });
      this.waiting = null;
    } else {
      this.buffer.push(item.value);
    }
  }

  close(): void {
    this.done = true;
    if (this.waiting) {
      this.waiting({ value: undefined as any, done: true });
      this.waiting = null;
    }
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    return {
      next: (): Promise<IteratorResult<T>> => {
        if (this.buffer.length > 0) {
          let value = this.buffer.shift() as T;
          return Promise.resolve({ value: value, done: false });
        }
        if (this.done) {
          return Promise.resolve({
            value: undefined as any,
            done: true
          });
        }
        return new Promise(resolve => {
          this.waiting = resolve;
        });
      }
    };
  }
}
