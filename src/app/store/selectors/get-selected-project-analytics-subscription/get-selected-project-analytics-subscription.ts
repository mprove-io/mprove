import { createSelector } from '@ngrx/store';
// tslint:disable-next-line:max-line-length
import { getSelectedProjectAnalyticsSubscriptionId } from 'app/store/selectors/get-selected-project/get-selected-project-analytics-subscription-id';
import { getSubscriptionsState } from 'app/store/selectors/get-state/get-subscriptions-state';
import * as api from 'app/api/_index';

export const getSelectedProjectAnalyticsSubscription = createSelector(
  getSubscriptionsState,
  getSelectedProjectAnalyticsSubscriptionId,
  (
    subscriptions: api.Subscription[],
    projectSubscriptionId: number) => {

    return subscriptions.find(s => s.subscription_id === projectSubscriptionId);
  }
);
