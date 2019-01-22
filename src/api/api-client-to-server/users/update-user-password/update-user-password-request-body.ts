import * as apiObjects from '../../../objects/_index';
import { UpdateUserPasswordRequestBodyPayload } from './update-user-password-request-body-payload';

export interface UpdateUserPasswordRequestBody {
  info: apiObjects.ClientRequest;
  payload: UpdateUserPasswordRequestBodyPayload;
}
