import * as api from '../../../_index';

export interface SetUserNameResponse200BodyPayload {
  user: api.User;
  members: api.Member[];
}
