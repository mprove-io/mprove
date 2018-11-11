import { createSelector } from '@ngrx/store';
import * as api from 'app/api/_index';
// tslint:disable-next-line:max-line-length
import { getSelectedProjectModeRepoDashboard } from 'app/store/selectors/get-selected-project-mode-repo-dashboard/get-selected-project-mode-repo-dashboard';

export const getSelectedProjectModeRepoDashboardReports = createSelector(
  getSelectedProjectModeRepoDashboard,
  (dashboard: api.Dashboard) => dashboard ? dashboard.reports : undefined
);
