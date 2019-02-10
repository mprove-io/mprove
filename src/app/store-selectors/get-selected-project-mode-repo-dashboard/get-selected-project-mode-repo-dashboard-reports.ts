import { createSelector } from '@ngrx/store';
import * as api from '@app/api/_index';

import { getSelectedProjectModeRepoDashboard } from '@app/store-selectors/get-selected-project-mode-repo-dashboard/get-selected-project-mode-repo-dashboard';

export const getSelectedProjectModeRepoDashboardReports = createSelector(
  getSelectedProjectModeRepoDashboard,
  (dashboard: api.Dashboard) => (dashboard ? dashboard.reports : undefined)
);
