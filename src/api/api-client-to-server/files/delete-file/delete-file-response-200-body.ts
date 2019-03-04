import * as apiObjects from '../../../objects/_index';
import { DeleteFileResponse200BodyPayload } from './delete-file-response-200-body-payload';


export interface DeleteFileResponse200Body {
  info: apiObjects.ServerResponse;
  payload: DeleteFileResponse200BodyPayload;
}
