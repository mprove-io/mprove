export interface FilesMoveFileRequestBodyPayload {
  project_id: string;
  repo_id: string;
  file_id: string;
  server_ts: number;
  to_path: string[];
}
