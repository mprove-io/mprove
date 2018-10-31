import * as api from '../../_index';

export interface QueriesRunQueriesDryResponse200BodyPayload {
  dry_id: string;
  valid_estimates: api.QueryEstimate[];
  error_queries: api.Query[];
}
