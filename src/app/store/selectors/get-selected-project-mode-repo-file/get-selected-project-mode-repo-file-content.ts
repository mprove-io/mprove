import { createSelector } from '@ngrx/store';
// tslint:disable-next-line:max-line-length
import { getSelectedProjectModeRepoFile } from 'src/app/store/selectors/get-selected-project-mode-repo-file/get-selected-project-mode-repo-file';
import * as api from 'src/app/api/_index';

export const getSelectedProjectModeRepoFileContent = createSelector(
  getSelectedProjectModeRepoFile,
  (file: api.CatalogFile) => file ? file.content : undefined
);
