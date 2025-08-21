import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { Struct } from '~common/interfaces/backend/struct';
import { BaseQuery } from './base.query';

export class StructState extends Struct {}

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
  metrics: [],
  presets: [],
  serverTs: undefined,
  formatNumber: undefined,
  currencyPrefix: undefined,
  currencySuffix: undefined,
  thousandsSeparator: undefined
};

@Injectable({ providedIn: 'root' })
export class StructQuery extends BaseQuery<StructState> {
  metrics$ = this.store.pipe(select(state => state.metrics));

  constructor() {
    super(createStore({ name: 'struct' }, withProps<StructState>(structState)));
  }
}
