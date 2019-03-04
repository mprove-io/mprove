import { FileLine } from './file-line';

export interface SwError {
  project_id: string;
  repo_id: string;
  struct_id: string;
  error_id: string;
  type: string;
  message: string;
  lines: FileLine[];
  server_ts: number;
}
