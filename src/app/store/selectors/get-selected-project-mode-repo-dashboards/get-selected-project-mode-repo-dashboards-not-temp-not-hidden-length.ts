import { createSelector } from '@ngrx/store';

import { getSelectedProjectModeRepoDashboardsNotTempNotHidden } from '@app/store/selectors/get-selected-project-mode-repo-dashboards/get-selected-project-mode-repo-dashboards-not-temp-not-hidden';
import * as api from '@app/api/_index';

export const getSelectedProjectModeRepoDashboardsNotTempNotHiddenLength = createSelector(
  getSelectedProjectModeRepoDashboardsNotTempNotHidden,
  (dashboards: api.Dashboard[]) => (dashboards ? dashboards.length : undefined)
);
