import * as apiObjects from '../../objects/_index';

export interface CancelSubscriptionsRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    project_id: string;
    cancel_message: string;
  };
}

export interface CancelSubscriptionsResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    project: apiObjects.Project;
    subscriptions: apiObjects.Subscription[];
  };
}
