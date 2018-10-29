export interface CatalogFile {
  project_id: string;
  repo_id: string;
  file_id: string;
  path: string[];
  name: string;
  content: string;
  deleted: boolean;
  server_ts: number;
}