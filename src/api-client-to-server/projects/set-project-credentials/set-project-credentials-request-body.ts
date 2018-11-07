import * as apiObjects from '../../../objects/_index';
import { SetProjectCredentialsRequestBodyPayload } from './set-project-credentials-request-body-payload';

export interface SetProjectCredentialsRequestBody {
  info: apiObjects.ClientRequest;
  payload: SetProjectCredentialsRequestBodyPayload;
}
