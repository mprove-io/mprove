import * as api from '../../_index';

export interface ReposRevertRepoToProductionRequestBodyPayload {
  project_id: string;
  repo_id: string;
  server_ts: number;
}
