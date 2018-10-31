export interface RenameFolderRequestBodyPayload {
  project_id: string;
  repo_id: string;
  node_id?: string;
  new_name: string;
  repo_server_ts: number;
}
