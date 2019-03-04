import * as apiObjects from '../../objects/_index';
import { ProcessQueryRequestBodyPayload } from './process-query-request-body-payload';

export interface ProcessQueryRequestBody {
  info: apiObjects.ServerRequestToBlockml;
  payload: ProcessQueryRequestBodyPayload;
}
