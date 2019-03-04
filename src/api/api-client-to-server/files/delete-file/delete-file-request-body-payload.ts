export interface DeleteFileRequestBodyPayload {
  project_id: string;
  repo_id: string;
  file_id: string;
  server_ts: number;
}
