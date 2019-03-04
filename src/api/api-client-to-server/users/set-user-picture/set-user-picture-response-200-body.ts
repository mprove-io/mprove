import * as apiObjects from '../../../objects/_index';
import { SetUserPictureResponse200BodyPayload } from './set-user-picture-response-200-body-payload';

export interface SetUserPictureResponse200Body {
  info: apiObjects.ServerResponse;
  payload: SetUserPictureResponse200BodyPayload;
}
