import { createSelector } from '@ngrx/store';

import { getSelectedProjectModeRepoFile } from 'app/store/selectors/get-selected-project-mode-repo-file/get-selected-project-mode-repo-file';
import * as api from 'app/api/_index';

export const getSelectedProjectModeRepoFileId = createSelector(
  getSelectedProjectModeRepoFile,
  (file: api.CatalogFile) => (file ? file.file_id : undefined)
);
