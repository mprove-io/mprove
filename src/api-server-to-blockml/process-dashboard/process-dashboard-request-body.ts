import * as api from '../../_index';

export interface ProcessDashboardRequestBody {
  info: api.ServerRequestToBlockml;
  payload: api.ProcessDashboardRequestBodyPayload;
}
