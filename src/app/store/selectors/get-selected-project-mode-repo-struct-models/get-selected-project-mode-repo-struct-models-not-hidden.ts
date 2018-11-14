import { createSelector } from '@ngrx/store';
import { getSelectedProjectModeRepoStructModels } from 'app/store/selectors/get-selected-project-mode-repo-struct-models/get-selected-project-mode-repo-struct-models';
import { getUserAlias } from 'app/store/selectors/get-user/get-user-alias';
import * as api from 'app/api/_index';

export const getSelectedProjectModeRepoStructModelsNotHidden = createSelector(
  getSelectedProjectModeRepoStructModels,
  getUserAlias,
  (models, userAlias) => {
    if (models && userAlias) {
      return models.filter(
        (model: api.Model) =>
          models &&
          !model.hidden &&
          (model.access_users.length === 0 ||
            model.access_users.findIndex(element => element === userAlias) > -1)
      );
    } else {
      return [];
    }
  }
);
