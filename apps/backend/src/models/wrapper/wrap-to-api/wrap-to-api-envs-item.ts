import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiEnvsItem(env: entities.EnvEntity): common.EnvsItem {
  return {
    projectId: env.project_id,
    envId: env.env_id
  };
}
