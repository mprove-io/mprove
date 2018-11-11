import * as apiObjects from '../../../objects/_index';
import { RevertRepoToProductionResponse200BodyPayload } from './revert-repo-to-production-response-200-body-payload';

export interface RevertRepoToProductionResponse200Body {
  info: apiObjects.ServerResponse;
  payload: RevertRepoToProductionResponse200BodyPayload;
}
