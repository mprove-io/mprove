import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { DashboardPart } from '~common/interfaces/backend/dashboard-part';
import { BaseQuery } from './base.query';

export class DashboardPartsFilteredState {
  dashboardPartsFiltered: DashboardPart[];
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
