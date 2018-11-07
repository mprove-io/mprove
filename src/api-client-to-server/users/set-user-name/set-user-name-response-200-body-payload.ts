import * as apiObjects from '../../../objects/_index';

export interface SetUserNameResponse200BodyPayload {
  user: apiObjects.User;
  members: apiObjects.Member[];
}
