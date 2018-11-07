import * as apiObjects from '../../../objects/_index';
import { SetUserPictureRequestBodyPayload } from './set-user-picture-request-body-payload';

export interface SetUserPictureRequestBody {
  info: apiObjects.ClientRequest;
  payload: SetUserPictureRequestBodyPayload;
}
