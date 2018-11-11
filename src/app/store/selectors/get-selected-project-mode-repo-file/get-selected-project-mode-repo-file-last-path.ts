import { createSelector } from '@ngrx/store';
// tslint:disable-next-line:max-line-length
import { getSelectedProjectModeRepoFilePath } from 'src/app/store/selectors/get-selected-project-mode-repo-file/get-selected-project-mode-repo-file-path';

export const getSelectedProjectModeRepoFileLastPath = createSelector(
  getSelectedProjectModeRepoFilePath,
  path => path ? path[path.length - 1] : undefined
);
