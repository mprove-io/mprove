import * as apiObjects from '../../../objects/_index';
import { DeleteProjectRequestBodyPayload } from './delete-project-request-body-payload';

export interface DeleteProjectRequestBody {
  info: apiObjects.ClientRequest;
  payload: DeleteProjectRequestBodyPayload;
}
