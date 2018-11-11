import { createSelector } from '@ngrx/store';
// tslint:disable-next-line:max-line-length
import { getSelectedProjectModeRepoId } from 'app/store/selectors/get-selected-project-mode-repo/get-selected-project-mode-repo-id';
// tslint:disable-next-line:max-line-length
import { getSelectedProjectModeRepoStructId } from 'app/store/selectors/get-selected-project-mode-repo/get-selected-project-mode-repo-struct-id';
import { getSelectedProjectId } from 'app/store/selectors/get-selected-project/get-selected-project-id';
import { getDashboardsState } from 'app/store/selectors/get-state/get-dashboards-state';
import * as api from 'app/api/_index';

export const getSelectedProjectModeRepoDashboardsNotTemp = createSelector(
  getDashboardsState,
  getSelectedProjectId,
  getSelectedProjectModeRepoId,
  getSelectedProjectModeRepoStructId,
  (
    dashboards,
    projectId,
    repoId,
    repoStructId) => {

    if (dashboards && projectId && repoId && repoStructId) {
      return dashboards.filter((dashboard: api.Dashboard) =>
        dashboard.project_id === projectId &&
        dashboard.repo_id === repoId &&
        dashboard.struct_id === repoStructId &&
        !dashboard.temp
      );

    } else {
      return [];
    }
  }
);
