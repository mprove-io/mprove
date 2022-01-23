import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { common } from '~front/barrels/common';
import { getExtendedFilters } from '../functions/get-extended-filters';
import { MqState, MqStore } from '../stores/mq.store';
import { ModelQuery } from './model.query';

@Injectable({ providedIn: 'root' })
export class MqQuery extends Query<MqState> {
  query$ = this.select(state => state.query);
  mconfig$ = this.select(state => state.mconfig);

  filters$ = this.select(state => state.mconfig.filters);

  extendedFilters$ = combineLatest([
    this.modelQuery.fields$,
    this.mconfig$
  ]).pipe(
    map(([fields, mconfig]: [common.ModelField[], common.MconfigX]) =>
      getExtendedFilters({
        fields: fields,
        mconfig: mconfig
      })
    )
  );

  constructor(protected store: MqStore, private modelQuery: ModelQuery) {
    super(store);
  }
}
