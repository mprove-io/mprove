import * as apiObjects from '../../../objects/_index';
import { DeleteMemberRequestBodyPayload } from './delete-member-request-body-payload';

export interface DeleteMemberRequestBody {
  info: apiObjects.ClientRequest;
  payload: DeleteMemberRequestBodyPayload;
}
