import * as apiObjects from '../../../objects/_index';
import { CreateDashboardResponse200BodyPayload } from './create-dashboard-response-200-body-payload';

export interface CreateDashboardResponse200Body {
  info: apiObjects.ServerResponse;
  payload: CreateDashboardResponse200BodyPayload;
}
