import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { makeExtendedFilters } from '../functions/make-extended-filters';
import { DashboardState, DashboardStore } from '../stores/dashboard.store';

@Injectable({ providedIn: 'root' })
export class DashboardQuery extends Query<DashboardState> {
  reports$ = this.select(state => state.reports);

  extendedFilters$ = this.select(dashboard => makeExtendedFilters(dashboard));

  constructor(protected store: DashboardStore) {
    super(store);
  }
}
