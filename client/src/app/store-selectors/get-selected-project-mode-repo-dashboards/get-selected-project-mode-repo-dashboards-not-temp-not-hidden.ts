import { createSelector } from '@ngrx/store';

import { getSelectedProjectModeRepoDashboardsNotTemp } from '@app/store-selectors/get-selected-project-mode-repo-dashboards/get-selected-project-mode-repo-dashboards-not-temp';
import { getUserAlias } from '@app/store-selectors/get-user/get-user-alias';
import * as api from '@app/api/_index';

export const getSelectedProjectModeRepoDashboardsNotTempNotHidden = createSelector(
  getSelectedProjectModeRepoDashboardsNotTemp,
  getUserAlias,
  (dashboards, userAlias) => {
    if (dashboards && userAlias) {
      return dashboards.filter(
        (dashboard: api.Dashboard) =>
          !dashboard.hidden &&
          (dashboard.access_users.length === 0 ||
            dashboard.access_users.findIndex(element => element === userAlias) >
              -1)
      );
    } else {
      return [];
    }
  }
);
