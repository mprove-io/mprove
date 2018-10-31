import * as api from '../../_index';

export interface ReposRevertRepoToLastCommitRequestBodyPayload {
  project_id: string;
  repo_id: string;
  server_ts: number;
}
