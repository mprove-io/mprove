import * as apiObjects from '../../objects/_index';
import { ProcessDashboardRequestBodyPayload } from './process-dashboard-request-body-payload';

export interface ProcessDashboardRequestBody {
  info: apiObjects.ServerRequestToBlockml;
  payload: ProcessDashboardRequestBodyPayload;
}
