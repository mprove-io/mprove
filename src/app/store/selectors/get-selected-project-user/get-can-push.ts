// tslint:disable:max-line-length
import { createSelector } from '@ngrx/store';
import { getSelectedProjectId } from 'app/store/selectors/get-selected-project/get-selected-project-id';
import { getUserId } from 'app/store/selectors/get-user/get-user-id';
import * as constants from 'app/constants/_index';

export const getCanPush = createSelector(
  getSelectedProjectId,
  getUserId,
  (projectId, userId) => {

    if (projectId === constants.DEMO) {
      return userId === 'akalitenya@mprove.io';

    } else {
      return true;
    }
  }
);
