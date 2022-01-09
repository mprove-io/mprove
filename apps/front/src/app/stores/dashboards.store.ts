import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';

export class DashboardWithExtendedFilters extends common.Dashboard {
  extendedFilters: interfaces.FilterExtended[];
}

export class DashboardsState {
  dashboards: DashboardWithExtendedFilters[];
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
