import { createSelector } from '@ngrx/store';
import { getSelectedProjectModeRepoId } from '@app/store-selectors/get-selected-project-mode-repo/get-selected-project-mode-repo-id';
import { getSelectedProjectModeRepoStructId } from '@app/store-selectors/get-selected-project-mode-repo/get-selected-project-mode-repo-struct-id';
import { getSelectedProjectId } from '@app/store-selectors/get-selected-project/get-selected-project-id';
import * as api from '@app/api/_index';
import { getViewsState } from '@app/store-selectors/get-state/get-views-state';

export const getSelectedProjectModeRepoStructViewsSorted = createSelector(
  getViewsState,
  getSelectedProjectId,
  getSelectedProjectModeRepoId,
  getSelectedProjectModeRepoStructId,
  (views, projectId, repoId, repoStructId) => {
    if (views && projectId && repoId && repoStructId) {
      return views
        .filter(
          (view: api.View) =>
            view.project_id === projectId &&
            view.repo_id === repoId &&
            view.struct_id === repoStructId
        )
        .sort((a, b) => {
          let nameA = a.view_id.toLowerCase();
          let nameB = b.view_id.toLowerCase();
          if (nameA < nameB) {
            // sort string ascending
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0; // default return value (no sorting)
        });
    } else {
      return [];
    }
  }
);
