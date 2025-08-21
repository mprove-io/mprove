import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { DashboardX } from '~common/interfaces/backend/dashboard-x';
import { BaseQuery } from './base.query';

export class FilteredDashboardsState {
  filteredDashboards: DashboardX[];
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
