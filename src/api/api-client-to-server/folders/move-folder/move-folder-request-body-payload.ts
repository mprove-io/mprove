export interface MoveFolderRequestBodyPayload {
  project_id: string;
  repo_id: string;
  node_id: string;
  to_path: string[];
  repo_server_ts: number;
}
