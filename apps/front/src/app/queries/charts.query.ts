import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import type { ChartX } from '#common/zod/backend/chart-x';
import { BaseQuery } from './base.query';

export class ChartsState {
  charts: ChartX[];
}

let chartsState: ChartsState = {
  charts: []
};

@Injectable({ providedIn: 'root' })
export class ChartsQuery extends BaseQuery<ChartsState> {
  charts$ = this.store.pipe(select(state => state.charts));

  constructor() {
    super(createStore({ name: 'charts' }, withProps<ChartsState>(chartsState)));
  }
}
