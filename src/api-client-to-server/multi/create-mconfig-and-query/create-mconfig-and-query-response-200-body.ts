import * as apiObjects from '../../../objects/_index';
import { CreateMconfigAndQueryResponse200BodyPayload } from './create-mconfig-and-query-response-200-body-payload';

export interface CreateMconfigAndQueryResponse200Body {
  info: apiObjects.ServerResponse;
  payload: CreateMconfigAndQueryResponse200BodyPayload;
}
