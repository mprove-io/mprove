// tslint:disable:max-line-length
import { createSelector } from '@ngrx/store';
import { getSelectedProjectModeRepoFile } from 'app/store/selectors/get-selected-project-mode-repo-file/get-selected-project-mode-repo-file';
import * as api from 'app/api/_index';

export const getSelectedProjectModeRepoFileName = createSelector(
  getSelectedProjectModeRepoFile,
  (file: api.CatalogFile) => (file ? file.name : undefined)
);
