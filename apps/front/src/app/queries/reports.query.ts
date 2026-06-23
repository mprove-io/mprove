import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import type { ReportTreeNode } from '#common/zod/backend/report-tree-node';
import type { ReportUnit } from '#common/zod/backend/report-unit';
import { BaseQuery } from './base.query';

export class ReportsState {
  reportUnitDrafts: ReportUnit[];
  reportNodes: ReportTreeNode[];
}

let reportsState: ReportsState = {
  reportUnitDrafts: [],
  reportNodes: []
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
