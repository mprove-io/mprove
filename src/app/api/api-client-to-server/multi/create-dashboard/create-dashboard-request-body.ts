import * as apiObjects from '../../../objects/_index';
import { CreateDashboardRequestBodyPayload } from './create-dashboard-request-body-payload';

export interface CreateDashboardRequestBody {
  info: apiObjects.ClientRequest;
  payload: CreateDashboardRequestBodyPayload;
}
