import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { ChartX } from '#common/interfaces/backend/chart-x';
import { BaseQuery } from './base.query';

export class FilteredChartsState {
  filteredCharts: ChartX[];
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
