import * as api from '../../../_index';

export interface CommitRepoRequestBody {
  info: api.ClientRequest;
  payload: api.CommitRepoRequestBodyPayload;
}
