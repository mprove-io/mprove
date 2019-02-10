import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-action-types/index';

export class SwitchAnalyticsSubscriptionPlanAction implements Action {
  readonly type = actionTypes.SWITCH_ANALYTICS_SUBSCRIPTION_PLAN;

  constructor(
    public payload: api.SwitchAnalyticsSubscriptionPlanRequestBody['payload']
  ) {}
}
