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
}

export class FractionExtended extends common.Fraction {
  hasDuplicates: boolean;
}

export class FilterExtended extends common.Filter {
  fractions: FractionExtended[];
  field: ColumnField;
}

@Injectable({ providedIn: 'root' })
export class MconfigQuery extends Query<MconfigState> {
  select$ = this.select(state => state.select);
  filters$ = this.select(state => state.filters);
  sortings$ = this.select(state => state.sortings);

  selectModelFields$ = combineLatest([
    this.modelQuery.fields$,
    this.select$,
    this.sortings$
  ]).pipe(
    map(
      ([fields, select, sortings]: [
        common.ModelField[],
        string[],
        common.Sorting[]
      ]) => {
        let selectFields: ColumnField[] = [];

        if (select && fields) {
          let selectDimensions: ColumnField[] = [];
          let selectMeasures: ColumnField[] = [];
          let selectCalculations: ColumnField[] = [];

          select.forEach((fieldId: string) => {
            let field = fields.find(f => f.id === fieldId);
            let f: ColumnField = Object.assign({}, field, {
              sorting: sortings.find(x => x.fieldId === fieldId),
              sortingNumber: sortings.findIndex(s => s.fieldId === fieldId)
            });

            if (field.fieldClass === common.FieldClassEnum.Dimension) {
              selectDimensions.push(f);
            } else if (field.fieldClass === common.FieldClassEnum.Measure) {
              selectMeasures.push(f);
            } else if (field.fieldClass === common.FieldClassEnum.Calculation) {
              selectCalculations.push(f);
            }

            selectFields = [
              ...selectDimensions,
              ...selectMeasures,
              ...selectCalculations
            ];
          });

          return selectFields;
        }
      }
    )
  );

  extendedFilters$ = combineLatest([
    this.modelQuery.fields$,
    this.filters$
  ]).pipe(
    map(([fields, filters]: [common.ModelField[], common.Filter[]]) => {
      let extendedFilters: FilterExtended[] = [];

      if (fields && filters) {
        extendedFilters = filters.map(filter =>
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
            ].map(fraction =>
              Object.assign({}, fraction, <FractionExtended>{
                hasDuplicates:
                  filter.fractions.filter(x => x.brick === fraction.brick)
                    .length > 1
              })
            )
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
