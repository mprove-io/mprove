import { and, eq } from 'drizzle-orm';
import type { QueryTab } from '#backend/drizzle/postgres/schema/_tabs';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import type { DbService } from '#backend/services/db/db.service';
import { isDefined } from '#common/functions/is-defined/is-defined';

export async function processMysqlError(item: {
  e: any;
  queryId: string;
  queryJobId: string;
  projectId: string;
  db: DbService;
}): Promise<void> {
  let { e, queryId, queryJobId, projectId, db } = item;

  let q: QueryTab = await db.queries.findFirstUnwrap({
    where: and(
      eq(queriesTable.queryId, queryId),
      eq(queriesTable.queryJobId, queryJobId),
      eq(queriesTable.projectId, projectId)
    )
  });

  if (isDefined(q)) {
    q.status = 'Error';
    q.data = [];
    q.queryJobId = undefined;
    q.lastErrorMessage = e.message;
    q.lastErrorTs = makeTsNumber();

    await db.writeUnwrap({
      insertOrUpdate: {
        queries: [q]
      }
    });
  }
}
