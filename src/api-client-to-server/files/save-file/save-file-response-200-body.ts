import * as apiObjects from '../../../objects/_index';
import { SaveFileResponse200BodyPayload } from './save-file-response-200-body-payload';

export interface SaveFileResponse200Body {
  info: apiObjects.ServerResponse;
  payload: SaveFileResponse200BodyPayload;
}
