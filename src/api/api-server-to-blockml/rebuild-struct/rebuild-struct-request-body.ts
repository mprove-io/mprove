import * as apiObjects from '../../objects/_index';
import { RebuildStructRequestBodyPayload } from './rebuild-struct-request-body-payload';

export interface RebuildStructRequestBody {
  info: apiObjects.ServerRequestToBlockml;
  payload: RebuildStructRequestBodyPayload;
}
