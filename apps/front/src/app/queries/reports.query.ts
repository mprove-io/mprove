import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import type { ReportUnit } from '#common/types/backend/report-unit';
import type { SpaceNode } from '#common/types/backend/space-node';
import { BaseQuery } from './base.query';

export class ReportsState {
  reportUnitDrafts: ReportUnit[];
  reportSpaceNodes: SpaceNode[];
}

let reportsState: ReportsState = {
  reportUnitDrafts: [],
  reportSpaceNodes: []
};

@Injectable({ providedIn: 'root' })
export class ReportsQuery extends BaseQuery<ReportsState> {
  reportUnitDrafts$ = this.store.pipe(select(state => state.reportUnitDrafts));

  constructor() {
    super(
      createStore({ name: 'reports' }, withProps<ReportsState>(reportsState))
    );
  }
}
