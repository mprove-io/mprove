import { Result } from '@praha/byethrow';
import { isNotNull } from 'drizzle-orm';
import { dconfigsTable } from '#backend/drizzle/postgres/schema/dconfigs';
import type { DbService } from '#backend/services/db/db.service';
import type { GetDconfigHashSecretError } from '#common/types/backend/function-errors/get-dconfig-hash-secret-error';

export async function getDconfigHashSecret(item: {
  db: DbService;
}): Result.ResultAsync<string, GetDconfigHashSecretError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('dconfig', v =>
      v.db.dconfigs.findFirst({
        where: isNotNull(dconfigsTable.dconfigId)
      })
    ),
    Result.map((v): string => v.dconfig?.hashSecret)
  );
}
