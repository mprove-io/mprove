import { createSelector } from '@ngrx/store';
// tslint:disable-next-line:max-line-length
import { getSelectedProjectModeRepoId } from 'app/store/selectors/get-selected-project-mode-repo/get-selected-project-mode-repo-id';
// tslint:disable-next-line:max-line-length
import { getSelectedProjectModeRepoStructId } from 'app/store/selectors/get-selected-project-mode-repo/get-selected-project-mode-repo-struct-id';
import { getSelectedProjectId } from 'app/store/selectors/get-selected-project/get-selected-project-id';
import { getErrorsState } from 'app/store/selectors/get-state/get-error-state';
import * as api from 'app/api/_index';

export const getSelectedProjectModeRepoErrors = createSelector(
  getErrorsState,
  getSelectedProjectId,
  getSelectedProjectModeRepoId,
  getSelectedProjectModeRepoStructId,
  (
    errors: api.SwError[],
    projectId: string,
    repoId: string,
    repoStructId: string
  ) => {
    if (errors && projectId && repoId && repoStructId) {
      return errors.filter(
        error =>
          error.project_id === projectId &&
          error.repo_id === repoId &&
          error.struct_id === repoStructId
      );
    } else {
      return [];
    }
  }
);
