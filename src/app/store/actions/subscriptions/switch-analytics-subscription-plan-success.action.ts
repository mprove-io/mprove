import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class SwitchAnalyticsSubscriptionPlanSuccessAction implements Action {
  readonly type = actionTypes.SWITCH_ANALYTICS_SUBSCRIPTION_PLAN_SUCCESS;

  constructor(public payload: api.SwitchAnalyticsSubscriptionPlanResponse200BodyPayload) {
  }
}
