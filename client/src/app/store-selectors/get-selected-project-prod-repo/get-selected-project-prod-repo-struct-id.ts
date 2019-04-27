import { createSelector } from '@ngrx/store';

import { getSelectedProjectRepos } from '@app/store-selectors/get-selected-project-repos/get-selected-project-repos';
import * as api from '@app/api/_index';
import * as enums from '@app/enums/_index';

export const getSelectedProjectProdRepoStructId = createSelector(
  getSelectedProjectRepos,
  (projectRepos: api.Repo[]) => {
    let prodRepo: api.Repo;

    if (projectRepos) {
      prodRepo = projectRepos.find(
        r => r.repo_id === enums.LayoutModeEnum.Prod.toString()
      );
    }

    return prodRepo.struct_id;
  }
);
