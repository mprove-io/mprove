import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { common } from '~front/barrels/common';
import { BaseQuery } from './base.query';

export class ReportsState {
  reports: common.ReportX[];
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
