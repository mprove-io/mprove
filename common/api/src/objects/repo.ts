import * as apiEnums from '../enums/_index';
import { CatalogNode } from './catalog-node';
import { FileLine } from './file-line';

export interface Repo {
  project_id: string;
  repo_id: string;
  struct_id: string;
  udfs_content: string;
  pdts_sorted: string[];
  nodes: CatalogNode[];
  status: apiEnums.RepoStatusEnum;
  conflicts: FileLine[];
  remote_url: string;
  remote_webhook: string;
  remote_public_key: string;
  remote_last_push_ts: number;
  remote_push_access_is_ok: boolean;
  remote_push_error_message: string;
  remote_need_manual_pull: boolean;
  remote_last_pull_ts: number;
  remote_pull_access_is_ok: boolean;
  remote_pull_error_message: string;
  server_ts: number;
}
