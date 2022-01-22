import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { common } from '~front/barrels/common';
import { DashboardStore } from '../stores/dashboard.store';

@Injectable({ providedIn: 'root' })
export class DashboardQuery extends Query<common.DashboardX> {
  constructor(protected store: DashboardStore) {
    super(store);
  }
}
