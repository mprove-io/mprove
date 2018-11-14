// tslint:disable:max-line-length
import { createSelector } from '@ngrx/store';
import { getSelectedProjectModeRepoId } from 'app/store/selectors/get-selected-project-mode-repo/get-selected-project-mode-repo-id';
import { getSelectedProjectModeRepoStructId } from 'app/store/selectors/get-selected-project-mode-repo/get-selected-project-mode-repo-struct-id';
import { getSelectedProjectId } from 'app/store/selectors/get-selected-project/get-selected-project-id';
import { getModelsState } from 'app/store/selectors/get-state/get-models-state';
import * as api from 'app/api/_index';

export const getSelectedProjectModeRepoStructModels = createSelector(
  getModelsState,
  getSelectedProjectId,
  getSelectedProjectModeRepoId,
  getSelectedProjectModeRepoStructId,
  (models, projectId, repoId, repoStructId) => {
    if (models && projectId && repoId && repoStructId) {
      return models.filter(
        (model: api.Model) =>
          model.project_id === projectId &&
          model.repo_id === repoId &&
          model.struct_id === repoStructId
      );
    } else {
      return [];
    }
  }
);
