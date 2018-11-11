import { createSelector } from '@ngrx/store';
// tslint:disable-next-line:max-line-length
import { getSelectedProjectModeRepoDashboard } from 'app/store/selectors/get-selected-project-mode-repo-dashboard/get-selected-project-mode-repo-dashboard';
import * as api from 'app/api/_index';

export const getSelectedProjectModeRepoDashboardId = createSelector(
  getSelectedProjectModeRepoDashboard,
  (dashboard: api.Dashboard) => dashboard ? dashboard.dashboard_id : undefined
);
