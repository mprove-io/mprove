import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import { connectionsTable } from '#backend/drizzle/postgres/tables/connections';
import type { DbService } from '#backend/services/db/db.service';
import type { CheckConnectionDoesNotExistError } from '#common/types/backend/function-errors/check-connection-does-not-exist-error';

export async function checkConnectionDoesNotExist(item: {
  db: DbService;
  projectId: string;
  envId: string;
  connectionId: string;
}): Result.ResultAsync<void, CheckConnectionDoesNotExistError> {
  return Result.pipe(
    Result.succeed(item),
    Result.andThen(v =>
      v.db.connections.isExist({
        where: and(
          eq(connectionsTable.connectionId, v.connectionId),
          eq(connectionsTable.envId, v.envId),
          eq(connectionsTable.projectId, v.projectId)
        )
      })
    ),
    Result.andThen(v =>
      v
        ? Result.fail({ code: 'BACKEND_CONNECTION_ALREADY_EXISTS' })
        : Result.succeed()
    )
  );
}
