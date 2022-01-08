import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { DashboardsState, DashboardsStore } from '../stores/dashboards.store';

@Injectable({ providedIn: 'root' })
export class DashboardsQuery extends Query<DashboardsState> {
  dashboards$ = this.select(state => state.dashboards);

  constructor(protected store: DashboardsStore) {
    super(store);
  }
}
