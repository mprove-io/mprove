import * as apiObjects from '../../objects/_index';

export interface GetQueryWithDepQueriesRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    query_id: string;

  };
}

export interface GetQueryWithDepQueriesResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    queries: apiObjects.Query[];
  };
}
