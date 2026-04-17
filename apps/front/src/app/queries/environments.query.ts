import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import type { Env } from '#common/zod/backend/env';
import { BaseQuery } from './base.query';

export class EnvironmentsState {
  environments: Env[];
}
let environmentsState: EnvironmentsState = {
  environments: []
};

@Injectable({ providedIn: 'root' })
export class EnvironmentsQuery extends BaseQuery<EnvironmentsState> {
  environments$ = this.store.pipe(select(state => state.environments));

  constructor() {
    super(
      createStore(
        { name: 'environments' },
        withProps<EnvironmentsState>(environmentsState)
      )
    );
  }
}
