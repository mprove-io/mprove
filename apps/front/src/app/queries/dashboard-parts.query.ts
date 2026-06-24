import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import type { DashboardUnit } from '#common/zod/backend/dashboard-unit';
import type { SpaceNode } from '#common/zod/backend/space-node';
import { BaseQuery } from './base.query';

export class DashboardPartsState {
  dashboardUnitDrafts: DashboardUnit[];
  dashboardSpaceNodes: SpaceNode[];
}

let dashboardPartsState: DashboardPartsState = {
  dashboardUnitDrafts: [],
  dashboardSpaceNodes: []
};

@Injectable({ providedIn: 'root' })
export class DashboardPartsQuery extends BaseQuery<DashboardPartsState> {
  dashboardUnitDrafts$ = this.store.pipe(
    select(state => state.dashboardUnitDrafts)
  );

  constructor() {
    super(
      createStore(
        { name: 'dashboardParts' },
        withProps<DashboardPartsState>(dashboardPartsState)
      )
    );
  }
}
