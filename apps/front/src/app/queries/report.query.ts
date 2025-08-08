import { Injectable } from '@angular/core';
import { createStore, withProps } from '@ngneat/elf';
import { common } from '~front/barrels/common';
import { BaseQuery } from './base.query';

export class ReportState extends common.ReportX {}

export const emptyReport: ReportState = {
  projectId: undefined,
  structId: undefined,
  reportId: common.EMPTY_REPORT_ID,
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
  chart: common.makeCopy(common.DEFAULT_CHART),
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
