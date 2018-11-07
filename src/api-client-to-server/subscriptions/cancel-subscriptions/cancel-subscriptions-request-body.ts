import * as apiObjects from '../../../objects/_index';
import { CancelSubscriptionsRequestBodyPayload } from './cancel-subscriptions-request-body-payload';

export interface CancelSubscriptionsRequestBody {
  info: apiObjects.ClientRequest;
  payload: CancelSubscriptionsRequestBodyPayload;
}
