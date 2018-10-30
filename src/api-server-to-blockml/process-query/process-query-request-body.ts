import * as api from '../../_index';

export interface ProcessQueryRequestBody {
  info: api.ServerRequestToBlockml;
  payload: api.ProcessQueryRequestBodyPayload;
}
