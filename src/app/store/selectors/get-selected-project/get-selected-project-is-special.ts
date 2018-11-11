import { createSelector } from '@ngrx/store';
import { getSelectedProjectId } from 'src/app/store/selectors/get-selected-project/get-selected-project-id';
import * as constants from 'src/app/constants/_index';

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
