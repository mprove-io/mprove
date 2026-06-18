import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import type { ReportNode } from '#common/zod/backend/report-node';
import type { ReportX } from '#common/zod/backend/report-x';
import { BaseQuery } from './base.query';

export class ReportsState {
  reports: ReportX[];
  reportNodes: ReportNode[];
}

let reportsState: ReportsState = {
  reports: [],
  reportNodes: []
};

@Injectable({ providedIn: 'root' })
export class ReportsQuery extends BaseQuery<ReportsState> {
  reports$ = this.store.pipe(select(state => state.reports));

  constructor() {
    super(
      createStore({ name: 'reports' }, withProps<ReportsState>(reportsState))
    );
  }
}
