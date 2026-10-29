import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BackendConfig } from '#backend/config/backend-config';
import type { StructTab } from '#backend/drizzle/postgres/tables/structs';
import { getStructCheckExists } from '#backend/functions/db/structs/get-struct-check-exists/get-struct-check-exists';
import type { DbService } from '#backend/services/db/db.service';
import type { GetStructCheckExistsAndNotChangedError } from '#common/types/backend/function-errors/get-struct-check-exists-and-not-changed-error';

export async function getStructCheckExistsAndNotChanged(item: {
  bridgeStructId: string;
  projectId: string;
  structId: string;
  cs: ConfigService<BackendConfig>;
  db: DbService;
}): Result.ResultAsync<StructTab, GetStructCheckExistsAndNotChangedError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('struct', v =>
      getStructCheckExists({
        structId: v.bridgeStructId,
        projectId: v.projectId,
        cs: v.cs,
        db: v.db
      })
    ),
    Result.andThrough(v =>
      v.structId !== v.bridgeStructId
        ? Result.fail({ code: 'BACKEND_STRUCT_ID_CHANGED' })
        : Result.succeed()
    ),
    Result.map((v): StructTab => v.struct)
  );
}
