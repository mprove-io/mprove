import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import type { Provider } from '#common/zod/backend/provider';
import { BaseQuery } from './base.query';

export class ProvidersState {
  providers: Provider[];
}

let providersState: ProvidersState = {
  providers: []
};

@Injectable({ providedIn: 'root' })
export class ProvidersQuery extends BaseQuery<ProvidersState> {
  providers$ = this.store.pipe(select(state => state.providers));

  constructor() {
    super(
      createStore(
        { name: 'providers' },
        withProps<ProvidersState>(providersState)
      )
    );
  }
}
