// tslint:disable:max-line-length
import { createSelector } from '@ngrx/store';
import { getSelectedProjectModeRepoFile } from 'src/app/store/selectors/get-selected-project-mode-repo-file/get-selected-project-mode-repo-file';
import * as api from 'src/app/api/_index';

export const getSelectedProjectModeRepoFilePath = createSelector(
  getSelectedProjectModeRepoFile,
  (file: api.CatalogFile) => file ? file.path : undefined
);
