import { Store } from '@ngneat/elf';

export class BaseQuery<T> {
  store;

  getValue() {
    return this.store.getValue();
  }

  update(state: T) {
    this.store.update(() => state);
  }

  updatePart(part: Partial<T>) {
    let state = this.store.getValue();
    let newState = Object.assign(<T>{}, state, part);
    this.store.update(() => newState);
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
