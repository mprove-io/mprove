import { createSelector } from '@ngrx/store';
import { getLayoutMode } from 'app/store/selectors/get-layout/get-layout-mode';
import { getSelectedProjectRepos } from 'app/store/selectors/get-selected-project-repos/get-selected-project-repos';
import { getUserId } from 'app/store/selectors/get-user/get-user-id';
import * as api from 'app/api/_index';
import * as enums from 'app/enums/_index';

export const getSelectedProjectModeRepo = createSelector(
  getSelectedProjectRepos,
  getLayoutMode,
  getUserId,
  (repos: api.Repo[], mode: enums.LayoutModeEnum, userId: string) => {

    if (repos && mode && userId) {
      let repoIndex: number;
      if (mode === enums.LayoutModeEnum.Prod) {
        repoIndex = repos.findIndex((repo: api.Repo) => repo.repo_id === enums.LayoutModeEnum.Prod.toString());
      } else {
        repoIndex = repos.findIndex((repo: api.Repo) => repo.repo_id === userId);
      }
      return repoIndex >= 0 ? repos[repoIndex] : undefined;

    } else {
      return undefined;
    }
  }
);
