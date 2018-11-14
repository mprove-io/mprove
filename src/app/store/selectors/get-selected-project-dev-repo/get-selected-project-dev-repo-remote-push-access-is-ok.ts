import { createSelector } from '@ngrx/store';
// tslint:disable-next-line:max-line-length
import { getSelectedProjectDevRepo } from 'app/store/selectors/get-selected-project-dev-repo/get-selected-project-dev-repo';
import * as api from 'app/api/_index';

export const getSelectedProjectDevRepoRemotePushAccessIsOk = createSelector(
  getSelectedProjectDevRepo,
  (repo: api.Repo) => (repo ? repo.remote_push_access_is_ok : undefined)
);
