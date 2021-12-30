import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { DashboardState, DashboardStore } from '../stores/dashboard.store';

@Injectable({ providedIn: 'root' })
export class DashboardQuery extends Query<DashboardState> {
  reports$ = this.select(state => state.reports);

  constructor(protected store: DashboardStore) {
    super(store);
  }
}
