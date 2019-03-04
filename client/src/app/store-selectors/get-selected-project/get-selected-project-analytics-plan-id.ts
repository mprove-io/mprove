import { createSelector } from '@ngrx/store';
import { getSelectedProject } from '@app/store-selectors/get-selected-project/get-selected-project';
import * as api from '@app/api/_index';

export const getSelectedProjectAnalyticsPlanId = createSelector(
  getSelectedProject,
  (project: api.Project) => (project ? project.analytics_plan_id : undefined)
);
