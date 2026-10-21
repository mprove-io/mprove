import type { Result } from '@praha/byethrow';

export class DbTabToEntConverter<Tab, Ent, E> {
  readonly tabToEnt: (item: {
    tab: Tab;
    hashSecret?: string;
  }) => Result.Result<Ent, E>;

  constructor(item: {
    tabToEnt: (item: {
      tab: Tab;
      hashSecret?: string;
    }) => Result.Result<Ent, E>;
  }) {
    this.tabToEnt = item.tabToEnt;
  }
}
