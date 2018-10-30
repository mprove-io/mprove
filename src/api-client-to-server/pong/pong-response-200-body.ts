import * as api from '../../_index';

export interface PongResponse200Body {
  info: api.ServerResponse;
  payload: api.PongResponse200BodyPayload;
}
