import { Injectable } from '@angular/core';
import { createStore, withProps } from '@ngneat/elf';
import { DEFAULT_CHART } from '~common/constants/mconfig-chart';
import { EMPTY_REPORT_ID } from '~common/constants/top';
import { makeCopy } from '~common/functions/make-copy';
import { ReportX } from '~common/interfaces/backend/report-x';
import { BaseQuery } from './base.query';

export class ReportState extends ReportX {}

export const emptyReport: ReportState = {
  projectId: undefined,
  structId: undefined,
  reportId: EMPTY_REPORT_ID,
  draft: false,
  creatorId: undefined,
  filePath: undefined,
  title: 'New Report',
  accessRoles: [],
  fields: [],
  extendedFilters: [],
  timezone: undefined,
  timeSpec: undefined,
  timeRangeFraction: undefined,
  // rangeOpen: undefined,
  // rangeClose: undefined,
  rangeStart: undefined,
  rangeEnd: undefined,
  metricsStartDateYYYYMMDD: undefined,
  metricsEndDateExcludedYYYYMMDD: undefined,
  metricsEndDateIncludedYYYYMMDD: undefined,
  timeColumnsLength: undefined,
  timeColumnsLimit: undefined,
  isTimeColumnsLimitExceeded: false,
  rows: [],
  chart: makeCopy(DEFAULT_CHART),
  columns: [],
  draftCreatedTs: undefined,
  serverTs: undefined,
  canEditOrDeleteReport: undefined,
  author: undefined
};

@Injectable({ providedIn: 'root' })
export class ReportQuery extends BaseQuery<ReportState> {
  constructor() {
    super(createStore({ name: 'report' }, withProps<ReportState>(emptyReport)));
  }
}
