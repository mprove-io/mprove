import { createSelector } from '@ngrx/store';
import { getProjectsState } from 'app/store/selectors/get-state/get-projects-state';
import * as api from 'app/api/_index';

export const getProjectsNotDeletedIds = createSelector(
  getProjectsState,
  (state: api.Project[]) =>
    state.filter(project => !project.deleted).map(project => project.project_id)
);
