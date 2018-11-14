import { createSelector } from '@ngrx/store';
// tslint:disable-next-line:max-line-length
import { getSelectedProjectModeRepo } from 'app/store/selectors/get-selected-project-mode-repo/get-selected-project-mode-repo';
import * as api from 'app/api/_index';

export const getSelectedProjectModeRepoIsNeedCommit = createSelector(
  getSelectedProjectModeRepo,
  (repo: api.Repo) =>
    repo ? repo.status === api.RepoStatusEnum.NeedCommit : undefined
);
