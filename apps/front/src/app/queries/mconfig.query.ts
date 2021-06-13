import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { common } from '~front/barrels/common';
import { MconfigState, MconfigStore } from '../stores/mconfig.store';
import { ModelQuery } from './model.query';

export class ColumnField extends common.ModelField {
  sorting: common.Sorting;
}

@Injectable({ providedIn: 'root' })
export class MconfigQuery extends Query<MconfigState> {
  select$ = this.select(state => state.select);
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
              sorting: sortings.find(x => x.fieldId === fieldId)
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
  constructor(protected store: MconfigStore, private modelQuery: ModelQuery) {
    super(store);
  }
}
