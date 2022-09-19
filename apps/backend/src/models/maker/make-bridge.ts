import { entities } from '~backend/barrels/entities';

export function makeBridge(item: {
  structId: string;
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
}) {
  let bridgeEntity: entities.BridgeEntity = {
    struct_id: item.structId,
    project_id: item.projectId,
    repo_id: item.repoId,
    branch_id: item.branchId,
    env_id: item.envId,
    server_ts: undefined
  };
  return bridgeEntity;
}
