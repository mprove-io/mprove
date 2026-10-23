import type { EnvTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { HashService } from '#backend/services/hash/hash.service';
import type { Ev } from '#common/types/backend/parts/ev';

export function makeEnv(item: {
  hashService: HashService;
  projectId: string;
  envId: string;
  evs: Ev[];
}): EnvTab {
  let { hashService, projectId, envId, evs } = item;

  let env: EnvTab = {
    envFullId: hashService.makeEnvFullId({
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
