import { api } from '../../../barrels/api';
import { entities } from '../../../barrels/entities';
import { helper } from '../../../barrels/helper';

export function wrapToApiRepo(repo: entities.RepoEntity): api.Repo {

  return {
    repo_id: repo.repo_id,
    project_id: repo.project_id,
    struct_id: repo.struct_id,
    udfs_content: repo.udfs_content,
    pdts_sorted: JSON.parse(repo.pdts_sorted),
    nodes: JSON.parse(repo.nodes),
    status: repo.status,
    conflicts: JSON.parse(repo.conflicts),
    remote_url: repo.remote_url,
    remote_webhook: repo.remote_webhook,
    remote_public_key: repo.remote_public_key,
    remote_last_push_ts: Number(repo.remote_last_push_ts),
    remote_push_access_is_ok: helper.benumToBoolean(repo.remote_push_access_is_ok),
    remote_push_error_message: repo.remote_push_error_message,
    remote_need_manual_pull: helper.benumToBoolean(repo.remote_need_manual_pull),
    remote_last_pull_ts: Number(repo.remote_last_pull_ts),
    remote_pull_access_is_ok: helper.benumToBoolean(repo.remote_pull_access_is_ok),
    remote_pull_error_message: repo.remote_pull_error_message,
    server_ts: Number(repo.server_ts),
  };
}
