import { createSelector } from '@ngrx/store';
import { getSelectedProjectDevRepo } from '@app/store/selectors/get-selected-project-dev-repo/get-selected-project-dev-repo';
import * as api from '@app/api/_index';

export const getSelectedProjectDevRepoRemoteLastPullTs = createSelector(
  getSelectedProjectDevRepo,
  (repo: api.Repo) => (repo ? repo.remote_last_pull_ts : undefined)
);
