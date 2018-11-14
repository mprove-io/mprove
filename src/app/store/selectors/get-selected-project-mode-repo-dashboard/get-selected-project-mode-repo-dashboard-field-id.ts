import { createSelector } from '@ngrx/store';

import { getSelectedProjectModeRepoDashboardId } from 'app/store/selectors/get-selected-project-mode-repo-dashboard/get-selected-project-mode-repo-dashboard-id';

import { getSelectedProjectModeRepoId } from 'app/store/selectors/get-selected-project-mode-repo/get-selected-project-mode-repo-id';
import { getSelectedProjectId } from 'app/store/selectors/get-selected-project/get-selected-project-id';
import { getFilesState } from 'app/store/selectors/get-state/get-files-state';
import * as api from 'app/api/_index';

export const getSelectedProjectModeRepoDashboardFileId = createSelector(
  getFilesState,
  getSelectedProjectId,
  getSelectedProjectModeRepoId,
  getSelectedProjectModeRepoDashboardId,
  (
    files: api.CatalogFile[],
    projectId: string,
    repoId: string,
    dashboardId: string
  ) => {
    // dashboards with temp:true don't have corresponding file
    let file = files.find(
      (f: api.CatalogFile) =>
        f.project_id === projectId &&
        f.repo_id === repoId &&
        f.name === `${dashboardId}.dashboard`
    );

    return file ? file.file_id : undefined;
  }
);
