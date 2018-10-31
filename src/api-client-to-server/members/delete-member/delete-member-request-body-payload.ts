import * as api from '../../../_index';

export interface DeleteMemberRequestBodyPayload {
  project_id: string;
  member_id: string;
  server_ts: number;
}
