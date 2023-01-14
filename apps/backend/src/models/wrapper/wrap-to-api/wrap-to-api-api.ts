import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiApi(item: { api: entities.ApiEntity }): common.Api {
  let { api } = item;

  return {
    structId: api.struct_id,
    apiId: api.api_id,
    filePath: api.file_path,
    label: api.label,
    steps: api.steps,
    serverTs: Number(api.server_ts)
  };
}
