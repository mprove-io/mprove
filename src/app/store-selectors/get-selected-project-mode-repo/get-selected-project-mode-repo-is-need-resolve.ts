import { createSelector } from '@ngrx/store';

import { getSelectedProjectModeRepo } from '@app/store-selectors/get-selected-project-mode-repo/get-selected-project-mode-repo';
import * as api from '@app/api/_index';

export const getSelectedProjectModeRepoIsNeedResolve = createSelector(
  getSelectedProjectModeRepo,
  (repo: api.Repo) =>
    repo ? repo.status === api.RepoStatusEnum.NeedResolve : undefined
);
