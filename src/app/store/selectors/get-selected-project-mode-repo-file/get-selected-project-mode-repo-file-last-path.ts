import { createSelector } from '@ngrx/store';

import { getSelectedProjectModeRepoFilePath } from '@app/store/selectors/get-selected-project-mode-repo-file/get-selected-project-mode-repo-file-path';

export const getSelectedProjectModeRepoFileLastPath = createSelector(
  getSelectedProjectModeRepoFilePath,
  path => (path ? path[path.length - 1] : undefined)
);
