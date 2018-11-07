import * as apiObjects from '../../objects/_index';
import { ProcessDashboardResponse200BodyPayload } from './process-dashboard-response-200-body-payload';

export interface ProcessDashboardResponse200Body {
  info: apiObjects.BlockmlResponse;
  payload: ProcessDashboardResponse200BodyPayload;
}
