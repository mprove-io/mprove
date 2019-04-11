import * as apiObjects from '../../objects/_index';

export interface SetLiveQueriesRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    init_id: string;
    live_queries: string[];
  };
}

export interface SetLiveQueriesResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    live_queries: string[];
    server_ts: number;
  };
}
