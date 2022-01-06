import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { common } from '~front/barrels/common';

export class ReportWithMconfigAndQuery extends common.Report {
  mconfig?: common.Mconfig;
  query?: common.Query;
}

export class DashboardState extends common.Dashboard {
  reports: ReportWithMconfigAndQuery[];
}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'dashboard',
  resettable: true
})
export class DashboardStore extends Store<DashboardState> {
  constructor() {
    super(<DashboardState>{
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
      fields: [],
      reports: [],
      description: undefined,
      serverTs: undefined
    });
  }
}
