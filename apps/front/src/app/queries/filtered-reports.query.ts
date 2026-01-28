import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { ReportX } from '#common/interfaces/backend/report-x';
import { BaseQuery } from './base.query';

export class FilteredReportsState {
  filteredReports: ReportX[];
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
