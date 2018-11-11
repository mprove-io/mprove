import { createSelector } from '@ngrx/store';
// tslint:disable-next-line:max-line-length
import { getSelectedProjectModeRepoId } from 'src/app/store/selectors/get-selected-project-mode-repo/get-selected-project-mode-repo-id';
import { getSelectedProjectId } from 'src/app/store/selectors/get-selected-project/get-selected-project-id';
import { getFilesState } from 'src/app/store/selectors/get-state/get-files-state';
import * as api from 'src/app/api/_index';

export const getSelectedProjectModeRepoFiles = createSelector(
  getFilesState,
  getSelectedProjectId,
  getSelectedProjectModeRepoId,
  (
    files: api.CatalogFile[],
    projectId: string,
    repoId: string) => {

    if (files && projectId && repoId) {

      return files.filter(file =>
        file.project_id === projectId &&
        file.repo_id === repoId);

    } else {
      return undefined;
    }
  }
);
