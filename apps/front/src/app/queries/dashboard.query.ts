import { Injectable } from '@angular/core';
import { createStore, withProps } from '@ngneat/elf';
import { common } from '~front/barrels/common';
import { BaseQuery } from './base.query';

export class DashboardState extends common.DashboardX {}

let dashboardState: DashboardState = {
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
  serverTs: undefined,
  author: undefined,
  canEditOrDeleteDashboard: undefined
};

@Injectable({ providedIn: 'root' })
export class DashboardQuery extends BaseQuery<common.DashboardX> {
  constructor() {
    super(
      createStore(
        { name: 'dashboard' },
        withProps<DashboardState>(dashboardState)
      )
    );
  }
}
