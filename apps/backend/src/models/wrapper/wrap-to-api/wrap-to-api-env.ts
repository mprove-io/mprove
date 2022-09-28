import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiEnv(item: {
  env: entities.EnvEntity;
  envConnectionIds: string[];
}): common.Env {
  let { env, envConnectionIds } = item;

  return {
    projectId: env.project_id,
    envId: env.env_id,
    envConnectionIds: envConnectionIds
  };
}
