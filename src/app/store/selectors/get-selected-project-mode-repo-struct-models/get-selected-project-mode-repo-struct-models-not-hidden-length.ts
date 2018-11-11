// tslint:disable:max-line-length
import { createSelector } from '@ngrx/store';
import { getSelectedProjectModeRepoStructModelsNotHidden } from 'src/app/store/selectors/get-selected-project-mode-repo-struct-models/get-selected-project-mode-repo-struct-models-not-hidden';
import * as api from 'src/app/api/_index';

export const getSelectedProjectModeRepoModelsNotHiddenLength = createSelector(
  getSelectedProjectModeRepoStructModelsNotHidden,
  (models: api.Model[]) => models ? models.length : undefined
);
