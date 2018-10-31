import * as api from '../../../_index';

export interface GetStateResponse200BodyPayload {
  init_id: string;
  state: api.State;
}
