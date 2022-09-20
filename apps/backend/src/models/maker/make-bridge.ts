import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function makeBridge(item: {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  structId: string;
  needValidate: common.BoolEnum;
}) {
  let bridgeEntity: entities.BridgeEntity = {
    project_id: item.projectId,
    repo_id: item.repoId,
    branch_id: item.branchId,
    env_id: item.envId,
    struct_id: item.structId,
    need_validate: item.needValidate,
    server_ts: undefined
  };
  return bridgeEntity;
}
