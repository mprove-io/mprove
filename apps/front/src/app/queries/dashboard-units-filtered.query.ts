import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import type { DashboardUnit } from '#common/zod/backend/dashboard-unit';
import { BaseQuery } from './base.query';

export class DashboardUnitsFilteredState {
  dashboardUnitsFiltered: DashboardUnit[];
}

let dashboardUnitsFiltered: DashboardUnitsFilteredState = {
  dashboardUnitsFiltered: []
};

@Injectable({ providedIn: 'root' })
export class DashboardUnitsFilteredQuery extends BaseQuery<DashboardUnitsFilteredState> {
  dashboardUnits$ = this.store.pipe(
    select(state => state.dashboardUnitsFiltered)
  );

  constructor() {
    super(
      createStore(
        { name: 'dashboardUnitsFiltered' },
        withProps<DashboardUnitsFilteredState>(dashboardUnitsFiltered)
      )
    );
  }
}
