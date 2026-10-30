import type { EnvTab } from '#backend/drizzle/postgres/tables/envs';
import type { MemberTab } from '#backend/drizzle/postgres/tables/members';
import { makeUserFullName } from '#backend/functions/db/users/make-user-full-name/make-user-full-name';
import type { Env } from '#common/types/backend/parts/env';
import type { EnvUser } from '#common/types/backend/parts/env-user';
import type { Ev } from '#common/types/backend/parts/ev';

export function envTabToApi(item: {
  env: EnvTab;
  envConnectionIds: string[];
  fallbackConnectionIds: string[];
  fallbackEvs: Ev[];
  envMembers: MemberTab[];
}): Env {
  let {
    env,
    envConnectionIds,
    fallbackConnectionIds,
    fallbackEvs,
    envMembers
  } = item;

  let envUsers: EnvUser[] = envMembers.map(member => {
    let envUser: EnvUser = {
      userId: member.memberId,
      alias: member.alias,
      firstName: member.firstName,
      lastName: member.lastName,
      fullName: makeUserFullName({
        firstName: member.firstName,
        lastName: member.lastName
      })
    };

    return envUser;
  });

  let apiEnv: Env = {
    projectId: env.projectId,
    envId: env.envId,
    envConnectionIds: envConnectionIds,
    fallbackConnectionIds: fallbackConnectionIds,
    envConnectionIdsWithFallback: [
      ...envConnectionIds,
      ...fallbackConnectionIds
    ].sort((a, b) => (a > b ? 1 : b > a ? -1 : 0)),
    evs: env.evs,
    fallbackEvIds: fallbackEvs.map(x => x.evId),
    evsWithFallback: [...env.evs, ...fallbackEvs].sort((a, b) =>
      a.evId > b.evId ? 1 : b.evId > a.evId ? -1 : 0
    ),
    envUsers: envUsers,
    isFallbackToProdConnections: env.isFallbackToProdConnections,
    isFallbackToProdVariables: env.isFallbackToProdVariables,
    useProdCache: env.useProdCache
  };

  return apiEnv;
}
