export interface FilesSaveFileRequestBodyPayload {
  project_id: string;
  repo_id: string;
  file_id: string;
  server_ts: number;
  content: string;
}
