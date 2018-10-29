import * as api from '../_index';

export interface Repo {
    project_id: string;
    repo_id: string;
    struct_id: string;
    udfs_content: string;
    pdts_sorted: string[];
    nodes: api.CatalogNode[];
    status: api.RepoStatusEnum;
    conflicts: api.FileLine[];
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
