import { createSelector } from '@ngrx/store';
import { getSelectedProjectAnalyticsSubscription } from 'app/store/selectors/get-selected-project-analytics-subscription/get-selected-project-analytics-subscription';
import * as api from 'app/api/_index';

export const getSelectedProjectAnalyticsSubscriptionPlanId = createSelector(
  getSelectedProjectAnalyticsSubscription,
  (s: api.Subscription) => (s ? s.plan_id : undefined)
);
