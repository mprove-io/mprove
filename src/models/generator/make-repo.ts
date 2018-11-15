import { api } from '../../barrels/api';
import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';

export function makeRepo(item: {
  project_id: string;
  repo_id: string;
  nodes: api.CatalogNode[];
  struct_id: string;
}): entities.RepoEntity {
  return {
    repo_id: item.repo_id,
    project_id: item.project_id,
    struct_id: item.struct_id,
    udfs_content: JSON.stringify([]), // same as returned from blockml
    pdts_sorted: JSON.stringify([]),
    nodes: JSON.stringify(item.nodes),
    status: api.RepoStatusEnum.Ok,
    conflicts: JSON.stringify([]),
    remote_url: undefined,
    remote_webhook: undefined,
    remote_public_key: undefined,
    remote_last_push_ts: (1).toString(),
    remote_push_access_is_ok: enums.bEnum.FALSE,
    remote_push_error_message: undefined,
    remote_need_manual_pull: enums.bEnum.FALSE,
    remote_last_pull_ts: (1).toString(),
    remote_pull_access_is_ok: enums.bEnum.FALSE,
    remote_pull_error_message: undefined,
    server_ts: undefined
  };
}
