import * as apiObjects from '../../objects/_index';

export interface SwitchAnalyticsSubscriptionPlanRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    project_id: string;
    analytics_plan_id: number;
  };
}

export interface SwitchAnalyticsSubscriptionPlanResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    project: apiObjects.Project;
    subscription: apiObjects.Subscription;
  };
}
