import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import type { ChartUnit } from '#common/zod/backend/chart-unit';
import { BaseQuery } from './base.query';

export class FilteredChartsState {
  filteredCharts: ChartUnit[];
}

let filteredCharts: FilteredChartsState = {
  filteredCharts: []
};

@Injectable({ providedIn: 'root' })
export class FilteredChartsQuery extends BaseQuery<FilteredChartsState> {
  charts$ = this.store.pipe(select(state => state.filteredCharts));

  constructor() {
    super(
      createStore(
        { name: 'filteredCharts' },
        withProps<FilteredChartsState>(filteredCharts)
      )
    );
  }
}
