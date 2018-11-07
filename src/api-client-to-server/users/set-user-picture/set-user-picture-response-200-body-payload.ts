import * as apiObjects from '../../../objects/_index';

export interface SetUserPictureResponse200BodyPayload {
  user: apiObjects.User;
  members: apiObjects.Member[];
}
