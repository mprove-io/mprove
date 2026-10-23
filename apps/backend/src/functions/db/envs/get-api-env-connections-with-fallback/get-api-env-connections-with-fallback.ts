import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { getApiEnvs } from '#backend/functions/db/envs/get-api-envs/get-api-envs';
import type { DbService } from '#backend/services/db/db.service';
import type { GetApiEnvConnectionsWithFallbackError } from '#common/types/backend/function-errors/get-api-env-connections-with-fallback-error';
import type { Env } from '#common/types/backend/parts/env';

export type GetApiEnvConnectionsWithFallbackOutput = {
  apiEnv: Env;
  connectionsWithFallback: ConnectionTab[];
};

export async function getApiEnvConnectionsWithFallback(item: {
  db: DbService;
  projectId: string;
  envId: string;
}): Result.ResultAsync<
  GetApiEnvConnectionsWithFallbackOutput,
  GetApiEnvConnectionsWithFallbackError
> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('apiEnvs', v =>
      getApiEnvs({ db: v.db, projectId: v.projectId })
    ),
    Result.bind('apiEnv', v =>
      Result.succeed(v.apiEnvs.find(x => x.envId === v.envId))
    ),
    Result.bind('connectionsWithFallback', v =>
      v.db.connections.findMany({
        where: and(
          eq(connectionsTable.projectId, v.projectId),
          inArray(
            connectionsTable.connectionId,
            v.apiEnv.envConnectionIdsWithFallback
          )
        )
      })
    ),
    Result.map(
      (v): GetApiEnvConnectionsWithFallbackOutput => ({
        apiEnv: v.apiEnv,
        connectionsWithFallback: v.connectionsWithFallback
      })
    )
  );
}
