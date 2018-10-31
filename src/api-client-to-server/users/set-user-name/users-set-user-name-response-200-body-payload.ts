import * as api from '../../_index';

export interface UsersSetUserNameResponse200BodyPayload {
  user: api.User;
  members: api.Member[];
}
