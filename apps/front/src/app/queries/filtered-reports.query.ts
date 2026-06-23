import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import type { ReportUnit } from '#common/zod/backend/report-unit';
import { BaseQuery } from './base.query';

export class FilteredReportsState {
  filteredReports: ReportUnit[];
}

let filteredReports: FilteredReportsState = {
  filteredReports: []
};

@Injectable({ providedIn: 'root' })
export class FilteredReportsQuery extends BaseQuery<FilteredReportsState> {
  reports$ = this.store.pipe(select(state => state.filteredReports));

  constructor() {
    super(
      createStore(
        { name: 'filteredReports' },
        withProps<FilteredReportsState>(filteredReports)
      )
    );
  }
}
