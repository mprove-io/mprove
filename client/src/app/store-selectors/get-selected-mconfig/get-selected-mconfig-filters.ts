import { createSelector } from '@ngrx/store';
import { getSelectedMconfig } from '@app/store-selectors/get-selected-mconfig/get-selected-mconfig';
import * as api from '@app/api/_index';

export const getSelectedMconfigFilters = createSelector(
  getSelectedMconfig,
  (mconfig: api.Mconfig) => {
    if (mconfig) {
      return mconfig.filters.map(filter => {
        return Object.assign({}, filter, {
          fractions: [
            ...filter.fractions.filter(
              fraction => fraction.operator === api.FractionOperatorEnum.Or
            ),
            ...filter.fractions.filter(
              fraction => fraction.operator === api.FractionOperatorEnum.And
            )
          ].map(fraction => {
            let hasDuplicates = false;

            if (
              filter.fractions.filter(x => x.brick === fraction.brick).length >
              1
            ) {
              hasDuplicates = true;
            }

            return Object.assign({}, fraction, {
              has_duplicates: hasDuplicates
            });
          })
        });
      });
    } else {
      return undefined;
    }
  }
  // (mconfig ? mconfig.filters : undefined)
);
