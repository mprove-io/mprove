import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { common } from '~front/barrels/common';
import { MconfigState, MconfigStore } from '../stores/mconfig.store';
import { ModelQuery } from './model.query';

@Injectable({ providedIn: 'root' })
export class MconfigQuery extends Query<MconfigState> {
  select$ = this.select(state => state.select);

  selectModelFields$ = combineLatest([
    this.modelQuery.fields$,
    this.select$
  ]).pipe(
    map(([fields, select]: [common.ModelField[], string[]]) => {
      let selectFields: common.ModelField[] = [];

      if (select && fields) {
        let selectDimensions: common.ModelField[] = [];
        let selectMeasures: common.ModelField[] = [];
        let selectCalculations: common.ModelField[] = [];

        select.forEach((fieldId: string) => {
          let field = fields.find(f => f.id === fieldId);

          if (field.fieldClass === common.FieldClassEnum.Dimension) {
            selectDimensions.push(field);
          } else if (field.fieldClass === common.FieldClassEnum.Measure) {
            selectMeasures.push(field);
          } else if (field.fieldClass === common.FieldClassEnum.Calculation) {
            selectCalculations.push(field);
          }

          selectFields = [
            ...selectDimensions,
            ...selectMeasures,
            ...selectCalculations
          ];
        });

        return selectFields;
      }
    })
  );
  constructor(protected store: MconfigStore, private modelQuery: ModelQuery) {
    super(store);
  }
}
