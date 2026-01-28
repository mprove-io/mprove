import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { DashboardPart } from '#common/interfaces/backend/dashboard-part';
import { BaseQuery } from './base.query';

export class DashboardPartsState {
  dashboardParts: DashboardPart[];
}

let dashboardPartsState: DashboardPartsState = {
  dashboardParts: []
};

@Injectable({ providedIn: 'root' })
export class DashboardPartsQuery extends BaseQuery<DashboardPartsState> {
  dashboardParts$ = this.store.pipe(select(state => state.dashboardParts));

  constructor() {
    super(
      createStore(
        { name: 'dashboardParts' },
        withProps<DashboardPartsState>(dashboardPartsState)
      )
    );
  }
}
