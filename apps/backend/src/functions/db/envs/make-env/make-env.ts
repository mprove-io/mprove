import type { EnvTab } from '#backend/drizzle/postgres/tables/envs';
import { makeEnvFullId } from '#backend/functions/db/envs/make-env-full-id/make-env-full-id';
import type { Ev } from '#common/types/backend/parts/ev';

export function makeEnv(item: {
  projectId: string;
  envId: string;
  evs: Ev[];
}): EnvTab {
  let { projectId, envId, evs } = item;

  let env: EnvTab = {
    envFullId: makeEnvFullId({
      projectId: projectId,
      envId: envId
    }),
    projectId: projectId,
    envId: envId,
    memberIds: [],
    isFallbackToProdConnections: true,
    isFallbackToProdVariables: true,
    useProdCache: true,
    evs: evs,
    keyTag: undefined,
    serverTs: undefined
  };

  return env;
}
