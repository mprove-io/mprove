import { createSelector } from '@ngrx/store';
import * as api from 'app/api/_index';
// tslint:disable-next-line:max-line-length
import { getSelectedProjectDevRepo } from 'app/store/selectors/get-selected-project-dev-repo/get-selected-project-dev-repo';

export const getSelectedProjectDevRepoRemotePullErrorMessage = createSelector(
  getSelectedProjectDevRepo,
  (repo: api.Repo) => repo ? repo.remote_pull_error_message : undefined
);
