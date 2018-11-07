import * as apiObjects from '../../../objects/_index';
// tslint:disable-next-line:max-line-length
import { SwitchAnalyticsSubscriptionPlanRequestBodyPayload } from './switch-analytics-subscription-plan-request-body-payload';

export interface SwitchAnalyticsSubscriptionPlanRequestBody {
  info: apiObjects.ClientRequest;
  payload: SwitchAnalyticsSubscriptionPlanRequestBodyPayload;
}
