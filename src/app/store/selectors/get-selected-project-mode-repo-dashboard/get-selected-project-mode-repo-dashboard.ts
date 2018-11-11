import { createSelector } from '@ngrx/store';
import { getLayoutDashboardId } from 'src/app/store/selectors/get-layout/get-layout-dashboard-id';
// tslint:disable-next-line:max-line-length
import { getSelectedProjectModeRepoId } from 'src/app/store/selectors/get-selected-project-mode-repo/get-selected-project-mode-repo-id';
import { getSelectedProjectId } from 'src/app/store/selectors/get-selected-project/get-selected-project-id';
import { getDashboardsState } from 'src/app/store/selectors/get-state/get-dashboards-state';
import * as api from 'src/app/api/_index';

export const getSelectedProjectModeRepoDashboard = createSelector(
  getDashboardsState,
  getSelectedProjectId,
  getSelectedProjectModeRepoId,
  getLayoutDashboardId,
  (dashboards, projectId, repoId, dashboardId) => {

    if (dashboards && projectId && repoId && dashboardId) {
      let dashboardIndex = dashboards.findIndex((dashboard: api.Dashboard) =>
        dashboard.dashboard_id === dashboardId &&
        dashboard.project_id === projectId &&
        dashboard.repo_id === repoId
      );
      return dashboardIndex >= 0 ? dashboards[dashboardIndex] : undefined;

    } else {
      return undefined;
    }
  }
);
