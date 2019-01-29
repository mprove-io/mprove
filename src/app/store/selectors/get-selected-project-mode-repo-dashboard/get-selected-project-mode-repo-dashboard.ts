import { createSelector } from '@ngrx/store';
import { getLayoutDashboardId } from '@app/store/selectors/get-layout/get-layout-dashboard-id';

import { getSelectedProjectModeRepoId } from '@app/store/selectors/get-selected-project-mode-repo/get-selected-project-mode-repo-id';
import { getSelectedProjectId } from '@app/store/selectors/get-selected-project/get-selected-project-id';
import { getDashboardsState } from '@app/store/selectors/get-state/get-dashboards-state';
import * as api from '@app/api/_index';

export const getSelectedProjectModeRepoDashboard = createSelector(
  getDashboardsState,
  getSelectedProjectId,
  getSelectedProjectModeRepoId,
  getLayoutDashboardId,
  (dashboards, projectId, repoId, dashboardId) => {
    if (dashboards && projectId && repoId && dashboardId) {
      let dashboardIndex = dashboards.findIndex(
        (dashboard: api.Dashboard) =>
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
