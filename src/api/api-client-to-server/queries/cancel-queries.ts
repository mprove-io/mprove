import * as apiObjects from '../../objects/_index';

export interface CancelQueriesRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    query_ids: string[];

  };
}

export interface CancelQueriesResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    canceled_queries: apiObjects.Query[];

  };
}