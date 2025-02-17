import { Injectable } from '@angular/core';
import { createStore, withProps } from '@ngneat/elf';
import { common } from '~front/barrels/common';
import { BaseQuery } from './base.query';

export class StructState extends common.Struct {}

let structState: StructState = {
  projectId: undefined,
  structId: undefined,
  mproveDirValue: undefined,
  weekStart: undefined,
  allowTimezones: false,
  caseSensitiveStringFilters: false,
  simplifySafeAggregates: false,
  defaultTimezone: undefined,
  errors: [],
  views: [],
  udfsDict: undefined,
  serverTs: undefined,
  formatNumber: undefined,
  currencyPrefix: undefined,
  currencySuffix: undefined
};

@Injectable({ providedIn: 'root' })
export class StructQuery extends BaseQuery<StructState> {
  constructor() {
    super(createStore({ name: 'struct' }, withProps<StructState>(structState)));
  }
}
