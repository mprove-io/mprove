import * as apiObjects from '../../../objects/_index';

export interface GetStateResponse200BodyPayload {
  init_id: string;
  state: apiObjects.State;
}
