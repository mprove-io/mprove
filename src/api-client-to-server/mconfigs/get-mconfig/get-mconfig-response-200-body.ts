import * as apiObjects from '../../../objects/_index';
import { GetMconfigResponse200BodyPayload } from './get-mconfig-response-200-body-payload';

export interface GetMconfigResponse200Body {
  info: apiObjects.ServerResponse;
  payload: GetMconfigResponse200BodyPayload;
}
