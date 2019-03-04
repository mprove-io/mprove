import * as apiObjects from '../../../objects/_index';
import { MoveFileResponse200BodyPayload } from './move-file-response-200-body-payload';


export interface MoveFileResponse200Body {
  info: apiObjects.ServerResponse;
  payload: MoveFileResponse200BodyPayload;
}
