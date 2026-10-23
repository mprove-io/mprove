import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import { givensTable } from '#backend/drizzle/postgres/schema/givens';
import { givenTabToApi } from '#backend/functions/db/givens/get-api-givens/given-tab-to-api/given-tab-to-api';
import type { DbService } from '#backend/services/db/db.service';
import type { GetApiGivensError } from '#common/types/backend/function-errors/get-api-givens-error';
import type { Given } from '#common/types/backend/parts/given/given';

export async function getApiGivens(item: {
  db: DbService;
  projectId: string;
}): Result.ResultAsync<Given[], GetApiGivensError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('givens', v =>
      v.db.givens.findMany({
        where: eq(givensTable.projectId, v.projectId)
      })
    ),
    Result.map((v): Given[] =>
      v.givens
        .map(given => givenTabToApi({ given: given }))
        .sort((a, b) =>
          a.givenId > b.givenId ? 1 : b.givenId > a.givenId ? -1 : 0
        )
    )
  );
}
