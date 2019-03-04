import { createSelector } from '@ngrx/store';
import * as constants from '@app/constants/_index';
import { getLayoutProjectId } from '@app/store-selectors/get-layout/get-layout-project-id';

export const getLayoutProjectIdIsDemo = createSelector(
  getLayoutProjectId,
  projectId => projectId === constants.DEMO
);
