import * as apiObjects from '../../../objects/_index';
import { EditMemberResponse200BodyPayload } from './edit-member-response-200-body-payload';

export interface EditMemberResponse200Body {
  info: apiObjects.ServerResponse;
  payload: EditMemberResponse200BodyPayload;
}
