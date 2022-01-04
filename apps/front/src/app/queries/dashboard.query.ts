import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';
import { DashboardState, DashboardStore } from '../stores/dashboard.store';

@Injectable({ providedIn: 'root' })
export class DashboardQuery extends Query<DashboardState> {
  reports$ = this.select(state => state.reports);

  extendedFilters$ = this.select(dashboard => {
    // console.log(dashboard);

    let extendedFilters: interfaces.FilterExtended[] = dashboard.fields.map(
      field => {
        let fractions = [
          ...field.fractions.filter(
            fraction => fraction.operator === common.FractionOperatorEnum.Or
          ),
          ...field.fractions.filter(
            fraction => fraction.operator === common.FractionOperatorEnum.And
          )
        ];

        let filterExtended: interfaces.FilterExtended = {
          field: field as any,
          fractions: fractions,
          fieldId: field.id
        };
        return filterExtended;
      }
    );

    return extendedFilters;
  });

  constructor(protected store: DashboardStore) {
    super(store);
  }
}
