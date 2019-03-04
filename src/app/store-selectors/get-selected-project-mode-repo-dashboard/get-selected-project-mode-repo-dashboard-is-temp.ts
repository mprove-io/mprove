import { createSelector } from '@ngrx/store';

import { getSelectedProjectModeRepoDashboard } from '@app/store-selectors/get-selected-project-mode-repo-dashboard/get-selected-project-mode-repo-dashboard';
import * as api from '@app/api/_index';

export const getSelectedProjectModeRepoDashboardIsTemp = createSelector(
  getSelectedProjectModeRepoDashboard,
  (dashboard: api.Dashboard) => (dashboard ? dashboard.temp : undefined)
);
