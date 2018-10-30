import * as api from '../../_index';

export interface ProjectsSetProjectCredentialsRequestBodyPayload {
  project_id: string;
  credentials: string;
  server_ts: number;
}
