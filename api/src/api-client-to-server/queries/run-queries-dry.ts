import * as apiObjects from '../../objects/_index';

export interface RunQueriesDryRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    dry_id: string;
    query_ids: string[];
  };
}

export interface RunQueriesDryResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    dry_id: string;
    valid_estimates: apiObjects.QueryEstimate[];
    error_queries: apiObjects.Query[];
  };
}
