import * as api from '../../_index';

export interface MultiSetLiveQueriesRequestBodyPayload {
  live_queries: string[];
  server_ts: number;
}
