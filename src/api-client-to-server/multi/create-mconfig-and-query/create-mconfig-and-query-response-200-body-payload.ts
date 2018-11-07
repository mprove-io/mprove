import * as apiObjects from '../../../objects/_index';

export interface CreateMconfigAndQueryResponse200BodyPayload {
  mconfig: apiObjects.Mconfig;
  queries: apiObjects.Query[];
}
