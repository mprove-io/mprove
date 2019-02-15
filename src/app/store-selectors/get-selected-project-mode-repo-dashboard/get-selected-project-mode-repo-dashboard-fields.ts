import { createSelector } from '@ngrx/store';

import { getSelectedProjectModeRepoDashboard } from '@app/store-selectors/get-selected-project-mode-repo-dashboard/get-selected-project-mode-repo-dashboard';
import * as api from '@app/api/_index';

export const getSelectedProjectModeRepoDashboardFields = createSelector(
  getSelectedProjectModeRepoDashboard,
  (dashboard: api.Dashboard) => {
    if (dashboard) {
      return dashboard.fields.map(field => {
        return Object.assign({}, field, {
          fractions: [
            ...field.fractions.filter(
              fraction => fraction.operator === api.FractionOperatorEnum.Or
            ),
            ...field.fractions.filter(
              fraction => fraction.operator === api.FractionOperatorEnum.And
            )
          ].map(fraction => {
            let hasDuplicates = false;

            if (
              field.fractions.filter(x => x.brick === fraction.brick).length > 1
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
);
