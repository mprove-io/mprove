import type { EnvTab } from '#backend/drizzle/postgres/tables/envs';
import type { EnvsItem } from '#common/types/backend/parts/envs-item';

export function wrapToApiEnvsItem(item: { env: EnvTab }): EnvsItem {
  let { env } = item;

  let apiEnvsItem: EnvsItem = {
    projectId: env.projectId,
    envId: env.envId
  };

  return apiEnvsItem;
}
