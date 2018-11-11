import { createSelector } from '@ngrx/store';
// tslint:disable-next-line:max-line-length
import { getSelectedProjectAnalyticsSubscription } from 'src/app/store/selectors/get-selected-project-analytics-subscription/get-selected-project-analytics-subscription';
import * as api from 'src/app/api/_index';

export const getSelectedProjectAnalyticsSubscriptionPlanId = createSelector(
  getSelectedProjectAnalyticsSubscription,
  (s: api.Subscription) => s ? s.plan_id : undefined
);
