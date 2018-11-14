import { createSelector } from '@ngrx/store';
// tslint:disable-next-line:max-line-length
import { getSelectedProjectAnalyticsPlanId } from 'app/store/selectors/get-selected-project/get-selected-project-analytics-plan-id';
import { getSelectedProjectId } from 'app/store/selectors/get-selected-project/get-selected-project-id';
import * as constants from 'app/constants/_index';

export const getSelectedProjectThemesRestricted = createSelector(
  getSelectedProjectId,
  getSelectedProjectAnalyticsPlanId,
  (projectId: string, analyticsPlanId: number) => {
    let restricted = false;

    if (
      projectId !== constants.DEMO &&
      projectId !== 'Mprove' &&
      projectId !== 'Wood' &&
      projectId !== 'futurama' &&
      projectId !== 'Test'
    ) {
      if (analyticsPlanId === 519436) {
        restricted = true;
      }
    }

    return restricted;
  }
);
