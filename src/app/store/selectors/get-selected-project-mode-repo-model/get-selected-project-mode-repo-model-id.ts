// tslint:disable:max-line-length
import { createSelector } from '@ngrx/store';
import { getSelectedProjectModeRepoModel } from 'app/store/selectors/get-selected-project-mode-repo-model/get-selected-project-mode-repo-model';
import * as api from 'app/api/_index';

export const getSelectedProjectModeRepoModelId = createSelector(
  getSelectedProjectModeRepoModel,
  (model: api.Model) => (model ? model.model_id : undefined)
);
