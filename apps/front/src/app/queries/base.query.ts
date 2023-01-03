import { setProps, Store } from '@ngneat/elf';

export class BaseQuery<T> {
  store;

  getValue() {
    return this.store.getValue();
  }

  update(state: T) {
    this.store.update(setProps(state));
  }

  reset() {
    this.store.reset();
  }

  select() {
    return this.store;
  }

  constructor(
    store: Store<
      {
        name: string;
        state: T;
        config: undefined;
      },
      T
    >
  ) {
    this.store = store;
  }
}
