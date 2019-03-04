import * as apiObjects from '../../objects/_index';
import { GetProjectsRequestBodyPayload } from './get-projects-request-body-payload';

export interface GetProjectsRequestBody {
  info: apiObjects.ServerRequestToBlockml;
  payload: GetProjectsRequestBodyPayload;
}
