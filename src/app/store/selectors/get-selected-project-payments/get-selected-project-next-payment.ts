import { createSelector } from '@ngrx/store';
import { getSelectedProjectAnalyticsSubscriptionPlanId } from 'app/store/selectors/get-selected-project-analytics-subscription/get-selected-project-analytics-subscription-plan-id';
import { getSelectedProjectPayments } from 'app/store/selectors/get-selected-project-payments/get-selected-project-payments';
import * as api from 'app/api/_index';

export const getSelectedProjectNextPayment = createSelector(
  getSelectedProjectPayments,
  getSelectedProjectAnalyticsSubscriptionPlanId,
  (payments: api.Payment[], planId: number) => {
    if (payments && planId && payments.length > 0 && !payments[0].is_paid) {
      return Object.assign({}, payments[0], { plan_id: planId });
    } else {
      return undefined;
    }
  }
);
