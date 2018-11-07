import * as apiObjects from '../../../objects/_index';
import { DeleteProjectResponse200BodyPayload } from './delete-project-response-200-body-payload';

export interface DeleteProjectResponse200Body {
  info: apiObjects.ServerResponse;
  payload: DeleteProjectResponse200BodyPayload;
}
