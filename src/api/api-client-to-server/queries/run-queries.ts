import * as apiObjects from '../../objects/_index';

export interface RunQueriesRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    query_ids: string[];
    refresh: boolean;
  };
}

export interface RunQueriesResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    running_queries: apiObjects.Query[];

  };
}
