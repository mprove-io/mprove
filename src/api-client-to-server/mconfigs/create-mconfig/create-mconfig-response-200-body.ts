import * as apiObjects from '../../../objects/_index';
import { CreateMconfigResponse200BodyPayload } from './create-mconfig-response-200-body-payload';

export interface CreateMconfigResponse200Body {
  info: apiObjects.ServerResponse;
  payload: CreateMconfigResponse200BodyPayload;
}
