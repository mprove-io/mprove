import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { ReportX } from '~common/interfaces/backend/report-x';
import { BaseQuery } from './base.query';

export class ReportsState {
  reports: ReportX[];
}

let reportsState: ReportsState = {
  reports: []
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
