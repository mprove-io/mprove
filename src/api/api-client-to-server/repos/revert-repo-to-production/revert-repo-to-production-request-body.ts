import * as apiObjects from '../../../objects/_index';
import { RevertRepoToProductionRequestBodyPayload } from './revert-repo-to-production-request-body-payload';

export interface RevertRepoToProductionRequestBody {
  info: apiObjects.ClientRequest;
  payload: RevertRepoToProductionRequestBodyPayload;
}
