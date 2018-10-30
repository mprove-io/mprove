import * as api from '../../_index';

export interface ProjectsSetProjectTimezoneRequestBodyPayload {
  project_id: string;
  timezone: string;
  server_ts: number;
}
