import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiEnv(env: entities.EnvEntity): common.Env {
  return {
    projectId: env.project_id,
    envId: env.env_id
  };
}
