import * as apiObjects from '../../../objects/_index';
import { CreateMemberRequestBodyPayload } from './create-member-request-body-payload';

export interface CreateMemberRequestBody {
  info: apiObjects.ClientRequest;
  payload: CreateMemberRequestBodyPayload;
}
