import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { common } from '~front/barrels/common';

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'dashboard',
  resettable: true
})
export class DashboardStore extends Store<common.DashboardX> {
  constructor() {
    super(<common.DashboardX>{
      structId: undefined,
      dashboardId: undefined,
      filePath: undefined,
      content: undefined,
      accessUsers: [],
      accessRoles: [],
      title: undefined,
      gr: undefined,
      temp: true,
      hidden: false,
      extendedFilters: [],
      fields: [],
      reports: [],
      description: undefined,
      serverTs: undefined
    });
  }
}
