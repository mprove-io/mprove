import * as apiObjects from '../../objects/_index';
import { GetProjectsResponse200BodyPayload } from './get-projects-response-200-body-payload';

export interface GetProjectsResponse200Body {
  info: apiObjects.BlockmlResponse;
  payload: GetProjectsResponse200BodyPayload;
}
