import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { ProviderTab } from '#backend/drizzle/postgres/tables/providers';
import { providersTable } from '#backend/drizzle/postgres/tables/providers';
import type { DbService } from '#backend/services/db/db.service';
import type { GetEnabledProviderCheckExistsError } from '#common/types/backend/function-errors/get-enabled-provider-check-exists-error';

export async function getEnabledProviderCheckExists(item: {
  projectId: string;
  providerId: string;
  db: DbService;
}): Result.ResultAsync<ProviderTab, GetEnabledProviderCheckExistsError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('provider', v =>
      v.db.providers.findFirstCheckExists({
        where: and(
          eq(providersTable.projectId, v.projectId),
          eq(providersTable.providerId, v.providerId)
        )
      })
    ),
    Result.andThrough(v =>
      v.provider.isEnabled === false
        ? Result.fail({ code: 'BACKEND_PROVIDER_IS_DISABLED' })
        : Result.succeed()
    ),
    Result.map((v): ProviderTab => v.provider)
  );
}
