import { Injectable } from '@angular/core';
import { createStore, withProps } from '@ngneat/elf';
import { common } from '~front/barrels/common';
import { BaseQuery } from './base.query';

export class ReportState extends common.ReportX {}

export const emptyRep: ReportState = {
  projectId: undefined,
  structId: undefined,
  repId: common.EMPTY_REP_ID,
  draft: false,
  creatorId: undefined,
  filePath: undefined,
  title: 'New Report',
  accessRoles: [],
  accessUsers: [],
  timezone: undefined,
  timeSpec: undefined,
  timeRangeFraction: undefined,
  timeColumnsLength: undefined,
  timeColumnsLimit: undefined,
  isTimeColumnsLimitExceeded: false,
  rows: [],
  columns: [],
  draftCreatedTs: undefined,
  serverTs: undefined,
  canEditOrDeleteRep: undefined,
  author: undefined
};

@Injectable({ providedIn: 'root' })
export class ReportQuery extends BaseQuery<ReportState> {
  constructor() {
    super(createStore({ name: 'report' }, withProps<ReportState>(emptyRep)));
  }
}
