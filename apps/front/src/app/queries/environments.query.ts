import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { common } from '~front/barrels/common';
import { BaseQuery } from './base.query';

export class EnvironmentsState {
  environments: common.Env[];
  total: number;
}
let environmentsState: EnvironmentsState = {
  environments: [],
  total: 0
};

@Injectable({ providedIn: 'root' })
export class EnvironmentsQuery extends BaseQuery<EnvironmentsState> {
  environments$ = this.store.pipe(select(state => state.environments));
  total$ = this.store.pipe(select(state => state.total));

  constructor() {
    super(
      createStore(
        { name: 'environments' },
        withProps<EnvironmentsState>(environmentsState)
      )
    );
  }
}
