import * as api from '../../../_index';

export interface PushRepoRequestBody {
  info: api.ClientRequest;
  payload: api.PushRepoRequestBodyPayload;
}
