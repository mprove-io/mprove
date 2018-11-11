import { createSelector } from '@ngrx/store';
// tslint:disable-next-line:max-line-length
import { getSelectedProjectDevRepo } from 'src/app/store/selectors/get-selected-project-dev-repo/get-selected-project-dev-repo';
import * as api from 'src/app/api/_index';

export const getSelectedProjectDevRepoRemoteLastPullTs = createSelector(
  getSelectedProjectDevRepo,
  (repo: api.Repo) => repo ? repo.remote_last_pull_ts : undefined
);
