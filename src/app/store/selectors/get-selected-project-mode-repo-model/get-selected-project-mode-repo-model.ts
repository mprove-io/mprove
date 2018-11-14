// tslint:disable:max-line-length
import { createSelector } from '@ngrx/store';
import { getLayoutModelId } from 'app/store/selectors/get-layout/get-layout-model-id';
import { getSelectedProjectModeRepoId } from 'app/store/selectors/get-selected-project-mode-repo/get-selected-project-mode-repo-id';
import { getSelectedProjectId } from 'app/store/selectors/get-selected-project/get-selected-project-id';
import { getModelsState } from 'app/store/selectors/get-state/get-models-state';
import * as api from 'app/api/_index';

export const getSelectedProjectModeRepoModel = createSelector(
  getModelsState,
  getSelectedProjectId,
  getSelectedProjectModeRepoId,
  getLayoutModelId,
  (models, projectId, repoId, modelId) => {
    if (models && projectId && repoId && modelId) {
      let modelIndex = models.findIndex(
        (model: api.Model) =>
          model.model_id === modelId &&
          model.project_id === projectId &&
          model.repo_id === repoId
      );
      return modelIndex >= 0 ? models[modelIndex] : undefined;
    } else {
      return undefined;
    }
  }
);
