import * as apiObjects from '../../objects/_index';
import { RebuildStructResponse200BodyPayload } from './rebuild-struct-response-200-body-payload';

export interface RebuildStructResponse200Body {
  info: apiObjects.BlockmlResponse;
  payload: RebuildStructResponse200BodyPayload;
}
