import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToEntityApi(x: common.Api): entities.ApiEntity {
  return {
    struct_id: x.structId,
    api_id: x.apiId,
    file_path: x.filePath,
    label: x.label,
    steps: x.steps,
    server_ts: x.serverTs.toString()
  };
}
