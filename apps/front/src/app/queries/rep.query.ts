import { Injectable } from '@angular/core';
import { createStore, withProps } from '@ngneat/elf';
import { common } from '~front/barrels/common';
import { BaseQuery } from './base.query';

export class RepState extends common.Rep {}

export const emptyRep: RepState = {
  structId: undefined,
  repId: common.EMPTY,
  filePath: undefined,
  title: 'Empty',
  timezone: undefined,
  timeSpec: undefined,
  timeRangeFraction: undefined,
  rows: [],
  columns: [],
  serverTs: undefined
};

@Injectable({ providedIn: 'root' })
export class RepQuery extends BaseQuery<common.Rep> {
  constructor() {
    super(createStore({ name: 'rep' }, withProps<RepState>(emptyRep)));
  }
}
