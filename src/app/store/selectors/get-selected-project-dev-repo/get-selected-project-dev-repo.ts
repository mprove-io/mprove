import { createSelector } from '@ngrx/store';
import { getSelectedProjectRepos } from 'app/store/selectors/get-selected-project-repos/get-selected-project-repos';
import { getUserId } from 'app/store/selectors/get-user/get-user-id';
import * as api from 'app/api/_index';

export const getSelectedProjectDevRepo = createSelector(
  getSelectedProjectRepos,
  getUserId,
  (projectRepos: api.Repo[], userId: string) => {
    let devRepo: api.Repo;

    if (projectRepos && userId) {
      devRepo = projectRepos.find(r => r.repo_id === userId);
    }

    return devRepo;
  }
);
