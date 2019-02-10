import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';

export class SwitchAnalyticsSubscriptionPlanFailAction implements Action {
  readonly type = actionTypes.SWITCH_ANALYTICS_SUBSCRIPTION_PLAN_FAIL;

  constructor(public payload: { error: any }) {}
}
