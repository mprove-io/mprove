import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { common } from '~front/barrels/common';
import { MconfigState, MconfigStore } from '../stores/mconfig.store';
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
export class MconfigQuery extends Query<MconfigState> {
  filters$ = this.select(state => state.filters);

  extendedFilters$ = combineLatest([
    this.modelQuery.fields$,
    this.select()
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

  constructor(protected store: MconfigStore, private modelQuery: ModelQuery) {
    super(store);
  }
}
