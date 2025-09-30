import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { Struct } from '~common/interfaces/backend/struct';
import { BaseQuery } from './base.query';

export class StructState extends Struct {}

let structState: StructState = {
  projectId: undefined,
  structId: undefined,
  mproveConfig: {
    mproveDirValue: undefined,
    caseSensitiveStringFilters: false,
    weekStart: undefined,
    allowTimezones: false,
    defaultTimezone: undefined,
    formatNumber: undefined,
    currencyPrefix: undefined,
    currencySuffix: undefined,
    thousandsSeparator: undefined
  },
  errors: [],
  metrics: [],
  presets: [],
  mproveVersion: undefined,
  serverTs: undefined
};

@Injectable({ providedIn: 'root' })
export class StructQuery extends BaseQuery<StructState> {
  metrics$ = this.store.pipe(select(state => state.metrics));

  constructor() {
    super(createStore({ name: 'struct' }, withProps<StructState>(structState)));
  }
}
