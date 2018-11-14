import { createSelector } from '@ngrx/store';
import { getSelectedProject } from 'app/store/selectors/get-selected-project/get-selected-project';
import * as api from 'app/api/_index';

export const getSelectedProjectWeekStart = createSelector(
  getSelectedProject,
  (project: api.Project) => (project ? project.week_start : undefined)
);
