// tslint:disable:max-line-length
import { createSelector } from '@ngrx/store';
import * as api from 'app/api/_index';
import { getSelectedProjectModeRepoErrors } from 'app/store/selectors/get-selected-project-mode-repo-errors/get-selected-project-mode-repo-errors';

export const getSelectedProjectModeRepoErrorsExist = createSelector(
  getSelectedProjectModeRepoErrors,
  (errors: api.SwError[]) => (errors ? errors.length > 0 : undefined)
);
