import * as apiObjects from '../../../objects/_index';
import { DeleteMemberResponse200BodyPayload } from './delete-member-response-200-body-payload';

export interface DeleteMemberResponse200Body {
  info: apiObjects.ServerResponse;
  payload: DeleteMemberResponse200BodyPayload;
}
