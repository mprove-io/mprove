import { createSelector } from '@ngrx/store';

import { getSelectedProjectModeRepoConflicts } from 'app/store/selectors/get-selected-project-mode-repo/get-selected-project-mode-repo-conflicts';

export const getSelectedProjectModeRepoConflictsLength = createSelector(
  getSelectedProjectModeRepoConflicts,
  conflicts => (conflicts ? conflicts.length : undefined)
);
