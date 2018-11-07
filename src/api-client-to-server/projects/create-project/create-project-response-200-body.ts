import * as apiObjects from '../../../objects/_index';
import { CreateProjectResponse200BodyPayload } from './create-project-response-200-body-payload';

export interface CreateProjectResponse200Body {
  info: apiObjects.ServerResponse;
  payload: CreateProjectResponse200BodyPayload;
}
