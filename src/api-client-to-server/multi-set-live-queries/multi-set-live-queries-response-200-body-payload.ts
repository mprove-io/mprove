import * as api from '../../_index';

export interface MultiSetLiveQueriesResponse200BodyPayload {
  live_queries: string[];
  server_ts: number;
}
