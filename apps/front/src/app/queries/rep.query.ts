import { Injectable } from '@angular/core';
import { createStore, withProps } from '@ngneat/elf';
import { common } from '~front/barrels/common';
import { BaseQuery } from './base.query';

export class RepState extends common.Rep {}

export const emptyRep: RepState = {
  structId: undefined,
  repId: common.EMPTY,
  filePath: undefined,
  title: undefined,
  timezone: undefined,
  timeSpec: undefined,
  timeRange: undefined,
  rows: [],
  serverTs: undefined
};

let repState: RepState = emptyRep;

@Injectable({ providedIn: 'root' })
export class RepQuery extends BaseQuery<common.Rep> {
  constructor() {
    super(createStore({ name: 'rep' }, withProps<RepState>(repState)));
  }
}
