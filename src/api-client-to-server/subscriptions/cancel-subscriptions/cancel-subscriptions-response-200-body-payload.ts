import * as apiObjects from '../../../objects/_index';

export interface CancelSubscriptionsResponse200BodyPayload {
  project: apiObjects.Project;
  subscriptions: apiObjects.Subscription[];
}
