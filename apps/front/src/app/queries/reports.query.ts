import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { common } from '~front/barrels/common';
import { BaseQuery } from './base.query';

export class ReportsState {
  reps: common.ReportX[];
}

let repsState: ReportsState = {
  reps: []
};

@Injectable({ providedIn: 'root' })
export class ReportsQuery extends BaseQuery<ReportsState> {
  reps$ = this.store.pipe(select(state => state.reps));

  constructor() {
    super(createStore({ name: 'reports' }, withProps<ReportsState>(repsState)));
  }
}
