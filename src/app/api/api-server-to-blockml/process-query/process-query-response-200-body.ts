import * as apiObjects from '../../objects/_index';
import { ProcessQueryResponse200BodyPayload } from './process-query-response-200-body-payload';

export interface ProcessQueryResponse200Body {
  info: apiObjects.BlockmlResponse;
  payload: ProcessQueryResponse200BodyPayload;
}
