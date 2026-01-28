import { Injectable } from '@angular/core';
import { createStore, withProps } from '@ngneat/elf';
import { DashboardX } from '#common/interfaces/backend/dashboard-x';
import { BaseQuery } from './base.query';

export class DashboardState extends DashboardX {}

let dashboardState: DashboardState = {
  structId: undefined,
  dashboardId: undefined,
  draft: true,
  creatorId: undefined,
  filePath: undefined,
  content: undefined,
  accessRoles: [],
  title: undefined,
  extendedFilters: [],
  fields: [],
  tiles: [],
  serverTs: undefined,
  author: undefined,
  canEditOrDeleteDashboard: undefined,
  storeModels: undefined
};

@Injectable({ providedIn: 'root' })
export class DashboardQuery extends BaseQuery<DashboardX> {
  constructor() {
    super(
      createStore(
        { name: 'dashboard' },
        withProps<DashboardState>(dashboardState)
      )
    );
  }
}
