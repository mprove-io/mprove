import * as apiObjects from '../../../objects/_index';
import { CreateMemberResponse200BodyPayload } from './create-member-response-200-body-payload';

export interface CreateMemberResponse200Body {
  info: apiObjects.ServerResponse;
  payload: CreateMemberResponse200BodyPayload;
}
