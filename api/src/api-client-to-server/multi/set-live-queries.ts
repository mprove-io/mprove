import * as apiObjects from '../../objects/_index';

export interface SetLiveQueriesRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    live_queries: string[];
    server_ts: number;
  };
}

export interface SetLiveQueriesResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    live_queries: string[];
    server_ts: number;
  };
}
