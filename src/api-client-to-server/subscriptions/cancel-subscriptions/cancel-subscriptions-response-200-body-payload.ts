import * as api from '../../../_index';

export interface CancelSubscriptionsResponse200BodyPayload {
  project: api.Project;
  subscriptions: api.Subscription[];
}
