import * as apiObjects from '../../../objects/_index';

export interface RunQueriesDryResponse200BodyPayload {
  dry_id: string;
  valid_estimates: apiObjects.QueryEstimate[];
  error_queries: apiObjects.Query[];
}
