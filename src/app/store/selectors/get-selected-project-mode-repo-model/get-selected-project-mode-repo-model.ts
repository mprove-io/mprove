// tslint:disable:max-line-length
import { createSelector } from '@ngrx/store';
import { getLayoutModelId } from 'src/app/store/selectors/get-layout/get-layout-model-id';
import { getSelectedProjectModeRepoId } from 'src/app/store/selectors/get-selected-project-mode-repo/get-selected-project-mode-repo-id';
import { getSelectedProjectId } from 'src/app/store/selectors/get-selected-project/get-selected-project-id';
import { getModelsState } from 'src/app/store/selectors/get-state/get-models-state';
import * as api from 'src/app/api/_index';

export const getSelectedProjectModeRepoModel = createSelector(
  getModelsState,
  getSelectedProjectId,
  getSelectedProjectModeRepoId,
  getLayoutModelId,
  (models, projectId, repoId, modelId) => {

    if (models && projectId && repoId && modelId) {
      let modelIndex = models.findIndex((model: api.Model) =>
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
