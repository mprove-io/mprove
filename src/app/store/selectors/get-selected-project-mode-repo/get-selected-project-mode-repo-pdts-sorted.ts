import { createSelector } from '@ngrx/store';
// tslint:disable-next-line:max-line-length
import { getSelectedProjectModeRepo } from 'app/store/selectors/get-selected-project-mode-repo/get-selected-project-mode-repo';
import * as api from 'app/api/_index';

export const getSelectedProjectModeRepoPdtsSorted = createSelector(
  getSelectedProjectModeRepo,
  (repo: api.Repo) => repo ? repo.pdts_sorted : undefined
);
