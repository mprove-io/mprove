import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class SwitchAnalyticsSubscriptionPlanAction implements Action {
  readonly type = actionTypes.SWITCH_ANALYTICS_SUBSCRIPTION_PLAN;

  constructor(public payload: api.SwitchAnalyticsSubscriptionPlanRequestBodyPayload) {
  }
}
