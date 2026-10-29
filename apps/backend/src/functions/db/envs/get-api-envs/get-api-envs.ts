import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import { connectionsTable } from '#backend/drizzle/postgres/tables/connections';
import type { EnvTab } from '#backend/drizzle/postgres/tables/envs';
import type { MemberTab } from '#backend/drizzle/postgres/tables/members';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { envTabToApi } from '#backend/functions/db/envs/get-api-envs/env-tab-to-api/env-tab-to-api';
import type { DbService } from '#backend/services/db/db.service';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import type { DbConnectionsFindManyError } from '#common/types/backend/function-errors/db/connections/db-connections-find-many-error';
import type { DbEnvsFindManyError } from '#common/types/backend/function-errors/db/envs/db-envs-find-many-error';
import type { DbMembersFindManyError } from '#common/types/backend/function-errors/db/members/db-members-find-many-error';
import type { GetApiEnvsError } from '#common/types/backend/function-errors/get-api-envs-error';
import type { Env } from '#common/types/backend/parts/env';

export async function getApiEnvs(item: {
  db: DbService;
  projectId: string;
}): Result.ResultAsync<Env[], GetApiEnvsError> {
  let { db, projectId } = item;

  let envResult: Result.Result<EnvTab[], DbEnvsFindManyError> =
    await db.envs.findMany({
      where: eq(connectionsTable.projectId, projectId)
    });

  if (Result.isFailure(envResult)) {
    return envResult;
  }

  let envs: EnvTab[] = envResult.value;

  let connectionResult: Result.Result<
    ConnectionTab[],
    DbConnectionsFindManyError
  > = await db.connections.findMany({
    where: and(
      eq(connectionsTable.projectId, projectId),
      inArray(
        connectionsTable.envId,
        envs.map(x => x.envId)
      )
    )
  });

  if (Result.isFailure(connectionResult)) {
    return connectionResult;
  }

  let connections: ConnectionTab[] = connectionResult.value;

  let memberResult: Result.Result<MemberTab[], DbMembersFindManyError> =
    await db.members.findMany({
      where: eq(membersTable.projectId, projectId)
    });

  if (Result.isFailure(memberResult)) {
    return memberResult;
  }

  let members: MemberTab[] = memberResult.value;

  let prodEnv: EnvTab = envs.find(x => x.envId === PROJECT_ENV_PROD);

  let apiEnvs: Env[] = envs
    .map(env => {
      let envConnectionIds: string[] = connections
        .filter(y => y.envId === env.envId)
        .map(connection => connection.connectionId);

      let apiEnv: Env = envTabToApi({
        env: env,
        envConnectionIds: envConnectionIds,
        fallbackConnectionIds:
          env.isFallbackToProdConnections === true
            ? connections
                .filter(
                  y =>
                    y.envId === PROJECT_ENV_PROD &&
                    envConnectionIds.indexOf(y.connectionId) < 0
                )
                .map(connection => connection.connectionId)
            : [],
        fallbackEvs:
          env.isFallbackToProdVariables === true
            ? prodEnv.evs.filter(
                y => env.evs.map(ev => ev.evId).indexOf(y.evId) < 0
              )
            : [],
        envMembers:
          env.envId === PROJECT_ENV_PROD
            ? []
            : members.filter(m => env.memberIds.indexOf(m.memberId) > -1)
      });

      return apiEnv;
    })
    .sort((a, b) =>
      a.envId !== PROJECT_ENV_PROD && b.envId === PROJECT_ENV_PROD
        ? 1
        : a.envId === PROJECT_ENV_PROD && b.envId !== PROJECT_ENV_PROD
          ? -1
          : a.envId > b.envId
            ? 1
            : b.envId > a.envId
              ? -1
              : 0
    );

  return Result.succeed(apiEnvs);
}
