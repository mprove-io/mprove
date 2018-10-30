import * as api from '../../_index';

export interface ProjectsSetProjectQuerySizeLimitRequestBodyPayload {
  project_id: string;
  query_size_limit: number;
  server_ts: number;
}
