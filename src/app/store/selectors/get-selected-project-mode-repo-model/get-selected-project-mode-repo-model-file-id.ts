// tslint:disable:max-line-length
import { createSelector } from '@ngrx/store';
import { getSelectedProjectModeRepoModelId } from 'src/app/store/selectors/get-selected-project-mode-repo-model/get-selected-project-mode-repo-model-id';
import { getSelectedProjectModeRepoId } from 'src/app/store/selectors/get-selected-project-mode-repo/get-selected-project-mode-repo-id';
import { getSelectedProjectId } from 'src/app/store/selectors/get-selected-project/get-selected-project-id';
import { getFilesState } from 'src/app/store/selectors/get-state/get-files-state';
import * as api from 'src/app/api/_index';

export const getSelectedProjectModeRepoModelFileId = createSelector(
  getFilesState,
  getSelectedProjectId,
  getSelectedProjectModeRepoId,
  getSelectedProjectModeRepoModelId,
  (
    files: api.CatalogFile[],
    projectId: string,
    repoId: string,
    modelId: string) => {

    let file = files.find((f: api.CatalogFile) =>
      f.project_id === projectId &&
      f.repo_id === repoId &&
      f.name === `${modelId}.model`
    );

    return file ? file.file_id : undefined;
  }
);
