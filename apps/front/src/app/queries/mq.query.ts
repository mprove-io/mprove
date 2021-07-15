import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { common } from '~front/barrels/common';
import { MqState, MqStore } from '../stores/mq.store';
import { ModelQuery } from './model.query';

export class ColumnField extends common.ModelField {
  sorting: common.Sorting;
  sortingNumber: number;
  isHideColumn: boolean;
}

export class FilterExtended extends common.Filter {
  fractions: common.Fraction[];
  field: ColumnField;
}

@Injectable({ providedIn: 'root' })
export class MqQuery extends Query<MqState> {
  query$ = this.select(state => state.query);
  mconfig$ = this.select(state => state.mconfig);

  filters$ = this.select(state => state.mconfig.filters);

  extendedFilters$ = combineLatest([
    this.modelQuery.fields$,
    this.mconfig$
  ]).pipe(
    map(([fields, mconfig]: [common.ModelField[], common.Mconfig]) => {
      let extendedFilters: FilterExtended[] = [];

      if (fields && mconfig.filters) {
        extendedFilters = mconfig.filters.map(filter =>
          Object.assign({}, filter, <FilterExtended>{
            field: fields.find(x => x.id === filter.fieldId),
            fractions: [
              ...filter.fractions.filter(
                fraction => fraction.operator === common.FractionOperatorEnum.Or
              ),
              ...filter.fractions.filter(
                fraction =>
                  fraction.operator === common.FractionOperatorEnum.And
              )
            ]
          })
        );
      }

      return extendedFilters;
    })
  );

  constructor(protected store: MqStore, private modelQuery: ModelQuery) {
    super(store);
  }
}
