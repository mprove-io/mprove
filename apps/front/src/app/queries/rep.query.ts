import { Injectable } from '@angular/core';
import { createStore, withProps } from '@ngneat/elf';
import { common } from '~front/barrels/common';
import { BaseQuery } from './base.query';

export class RepState extends common.RepX {}

export const emptyRep: RepState = {
  projectId: undefined,
  structId: undefined,
  repId: common.EMPTY,
  draft: false,
  creatorId: undefined,
  filePath: undefined,
  title: 'Empty',
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
  serverTs: undefined,
  canEditOrDeleteRep: undefined,
  author: undefined
};

@Injectable({ providedIn: 'root' })
export class RepQuery extends BaseQuery<RepState> {
  constructor() {
    super(createStore({ name: 'rep' }, withProps<RepState>(emptyRep)));
  }
}
