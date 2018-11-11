import { createSelector } from '@ngrx/store';
import { getSelectedProject } from 'app/store/selectors/get-selected-project/get-selected-project';
import * as api from 'app/api/_index';

export const getSelectedProjectBqProject = createSelector(
  getSelectedProject,
  (project: api.Project) => project ? project.bq_project : undefined
);
