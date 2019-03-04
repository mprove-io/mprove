import * as apiObjects from '../../../objects/_index';
import { EditMemberRequestBodyPayload } from './edit-member-request-body-payload';

export interface EditMemberRequestBody {
  info: apiObjects.ClientRequest;
  payload: EditMemberRequestBodyPayload;
}
