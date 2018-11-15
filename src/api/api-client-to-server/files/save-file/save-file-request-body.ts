import * as apiObjects from '../../../objects/_index';
import { SaveFileRequestBodyPayload } from './save-file-request-body-payload';

export interface SaveFileRequestBody {
  info: apiObjects.ClientRequest;
  payload: SaveFileRequestBodyPayload;
}
