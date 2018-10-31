import * as api from '../../../_index';

export interface PullRepoRequestBody {
  info: api.ClientRequest;
  payload: api.PullRepoRequestBodyPayload;
}
