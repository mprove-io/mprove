import { entities } from '~backend/barrels/entities';

export function makeEnv(item: { projectId: string; envId: string }) {
  let envEntity: entities.EnvEntity = {
    project_id: item.projectId,
    env_id: item.envId,
    server_ts: undefined
  };
  return envEntity;
}
