import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import { providersTable } from '#backend/drizzle/postgres/schema/providers';
import type { DbService } from '#backend/services/db/db.service';
import type { CheckProviderDoesNotExistError } from '#common/types/backend/function-errors/check-provider-does-not-exist-error';

export async function checkProviderDoesNotExist(item: {
  projectId: string;
  providerId: string;
  db: DbService;
}): Result.ResultAsync<void, CheckProviderDoesNotExistError> {
  let { projectId, providerId, db } = item;

  let isProviderExist: boolean = await db.providers.isExistUnwrap({
    where: and(
      eq(providersTable.projectId, projectId),
      eq(providersTable.providerId, providerId)
    )
  });

  return isProviderExist
    ? Result.fail({ code: 'BACKEND_PROVIDER_ALREADY_EXISTS' })
    : Result.succeed();
}
