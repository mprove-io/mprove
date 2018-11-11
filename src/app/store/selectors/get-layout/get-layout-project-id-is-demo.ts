import { createSelector } from '@ngrx/store';
import * as constants from 'src/app/constants/_index';
import { getLayoutProjectId } from 'src/app/store/selectors/get-layout/get-layout-project-id';

export const getLayoutProjectIdIsDemo = createSelector(
  getLayoutProjectId,
  projectId => projectId === constants.DEMO
);
