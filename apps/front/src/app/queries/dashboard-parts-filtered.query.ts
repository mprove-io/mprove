import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import type { DashboardUnit } from '#common/zod/backend/dashboard-unit';
import { BaseQuery } from './base.query';

export class DashboardPartsFilteredState {
  dashboardPartsFiltered: DashboardUnit[];
}

let dashboardPartsFiltered: DashboardPartsFilteredState = {
  dashboardPartsFiltered: []
};

@Injectable({ providedIn: 'root' })
export class DashboardPartsFilteredQuery extends BaseQuery<DashboardPartsFilteredState> {
  dashboardParts$ = this.store.pipe(
    select(state => state.dashboardPartsFiltered)
  );

  constructor() {
    super(
      createStore(
        { name: 'dashboardPartsFiltered' },
        withProps<DashboardPartsFilteredState>(dashboardPartsFiltered)
      )
    );
  }
}
