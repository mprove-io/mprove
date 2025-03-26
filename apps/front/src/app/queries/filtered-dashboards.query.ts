import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { common } from '~front/barrels/common';
import { BaseQuery } from './base.query';

export class FilteredDashboardsState {
  filteredDashboards: common.DashboardX[];
}

let filteredDashboards: FilteredDashboardsState = {
  filteredDashboards: []
};

@Injectable({ providedIn: 'root' })
export class FilteredDashboardsQuery extends BaseQuery<FilteredDashboardsState> {
  dashboards$ = this.store.pipe(select(state => state.filteredDashboards));

  constructor() {
    super(
      createStore(
        { name: 'filteredDashboards' },
        withProps<FilteredDashboardsState>(filteredDashboards)
      )
    );
  }
}
