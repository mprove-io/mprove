import * as api from '../../../_index';

export interface SetUserPictureResponse200BodyPayload {
  user: api.User;
  members: api.Member[];
}
