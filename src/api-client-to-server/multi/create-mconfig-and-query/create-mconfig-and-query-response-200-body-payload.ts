import * as api from '../../../_index';

export interface CreateMconfigAndQueryResponse200BodyPayload {
  mconfig: api.Mconfig;
  queries: api.Query[];
}
