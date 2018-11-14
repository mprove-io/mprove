// tslint:disable:max-line-length
import { createSelector } from '@ngrx/store';
import { getSelectedProjectId } from 'app/store/selectors/get-selected-project/get-selected-project-id';
import { getReposState } from 'app/store/selectors/get-state/get-repos-state';
import * as api from 'app/api/_index';

export const getSelectedProjectRepos = createSelector(
  getReposState,
  getSelectedProjectId,
  (repos: api.Repo[], projectId: string) => {
    if (repos && projectId) {
      return repos.filter((repo: api.Repo) => repo.project_id === projectId);
    } else {
      return [];
    }
  }
);
