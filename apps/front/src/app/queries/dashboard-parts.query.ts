import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import type { DashboardUnit } from '#common/zod/backend/dashboard-unit';
import type { SpaceNode } from '#common/zod/backend/space-node';
import { BaseQuery } from './base.query';

export class DashboardUnitsState {
  dashboardUnitDrafts: DashboardUnit[];
  dashboardSpaceNodes: SpaceNode[];
}

let dashboardUnitsState: DashboardUnitsState = {
  dashboardUnitDrafts: [],
  dashboardSpaceNodes: []
};

@Injectable({ providedIn: 'root' })
export class DashboardUnitsQuery extends BaseQuery<DashboardUnitsState> {
  dashboardUnitDrafts$ = this.store.pipe(
    select(state => state.dashboardUnitDrafts)
  );

  constructor() {
    super(
      createStore(
        { name: 'dashboardUnits' },
        withProps<DashboardUnitsState>(dashboardUnitsState)
      )
    );
  }
}
