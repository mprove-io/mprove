import * as api from '../../_index';

export interface ReposPullRepoRequestBodyPayload {
  project_id: string;
  repo_id: string;
  server_ts: number;
  from_remote: boolean;
}
