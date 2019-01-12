import * as apiObjects from '../../../objects/_index';

export interface LoginUserResponse200BodyPayload {
  email_verified: boolean;
  token?: string;
  user_id?: string;
}
