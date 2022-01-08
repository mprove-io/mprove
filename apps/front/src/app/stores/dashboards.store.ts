import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { common } from '~front/barrels/common';

export class DashboardsState {
  dashboards: common.Dashboard[];
}

function createInitialState(): DashboardsState {
  return {
    dashboards: []
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'dashboards',
  resettable: true
})
export class DashboardsStore extends Store<DashboardsState> {
  constructor() {
    super(createInitialState());
  }
}
