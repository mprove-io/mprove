import { createSelector } from '@ngrx/store';
// tslint:disable-next-line:max-line-length
import { getSelectedProjectModeRepoDashboard } from 'src/app/store/selectors/get-selected-project-mode-repo-dashboard/get-selected-project-mode-repo-dashboard';
import * as api from 'src/app/api/_index';

export const getSelectedProjectModeRepoDashboardFields = createSelector(
  getSelectedProjectModeRepoDashboard,
  (dashboard: api.Dashboard) => dashboard ? dashboard.fields : undefined
);
