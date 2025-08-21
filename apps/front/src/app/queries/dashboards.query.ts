import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { DashboardX } from '~common/interfaces/backend/dashboard-x';
import { BaseQuery } from './base.query';

export class DashboardsState {
  dashboards: DashboardX[];
}

let dashboardsState: DashboardsState = {
  dashboards: []
};

@Injectable({ providedIn: 'root' })
export class DashboardsQuery extends BaseQuery<DashboardsState> {
  dashboards$ = this.store.pipe(select(state => state.dashboards));

  constructor() {
    super(
      createStore(
        { name: 'dashboards' },
        withProps<DashboardsState>(dashboardsState)
      )
    );
  }
}
