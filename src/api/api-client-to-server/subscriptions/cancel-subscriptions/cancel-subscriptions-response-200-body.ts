import * as apiObjects from '../../../objects/_index';
import { CancelSubscriptionsResponse200BodyPayload } from './cancel-subscriptions-response-200-body-payload';

export interface CancelSubscriptionsResponse200Body {
  info: apiObjects.ServerResponse;
  payload: CancelSubscriptionsResponse200BodyPayload;
}
