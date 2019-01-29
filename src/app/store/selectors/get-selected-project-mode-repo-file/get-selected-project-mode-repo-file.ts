import { createSelector } from '@ngrx/store';
import { getLayoutFileId } from '@app/store/selectors/get-layout/get-layout-file-id';
import { getSelectedProjectModeRepoId } from '@app/store/selectors/get-selected-project-mode-repo/get-selected-project-mode-repo-id';
import { getSelectedProjectId } from '@app/store/selectors/get-selected-project/get-selected-project-id';
import { getFilesState } from '@app/store/selectors/get-state/get-files-state';
import * as api from '@app/api/_index';

export const getSelectedProjectModeRepoFile = createSelector(
  getFilesState,
  getSelectedProjectId,
  getSelectedProjectModeRepoId,
  getLayoutFileId,
  (
    files: api.CatalogFile[],
    projectId: string,
    repoId: string,
    fileId: string
  ) => {
    if (files && projectId && repoId && fileId) {
      let fileIndex = files.findIndex(
        (file: api.CatalogFile) =>
          file.file_id === fileId &&
          file.project_id === projectId &&
          file.repo_id === repoId
      );
      return fileIndex >= 0 ? files[fileIndex] : undefined;
    } else {
      return undefined;
    }
  }
);
