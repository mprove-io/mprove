import { createSelector } from '@ngrx/store';
import { getSelectedProjectId } from 'app/store/selectors/get-selected-project/get-selected-project-id';
import * as constants from 'app/constants/_index';

export const getSelectedProjectIsSpecial = createSelector(
  getSelectedProjectId,
  (projectId: string) => {

    return projectId === constants.DEMO ||
      projectId === 'Mprove' ||
      projectId === 'Wood' ||
      projectId === 'futurama' ||
      projectId === 'Test';
  }
);
