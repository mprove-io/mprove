import { inArray, sql } from 'drizzle-orm';
import type { QueryResult } from 'pg';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import type { DbService } from '#backend/services/db/db.service';

export async function removeQueries(item: { db: DbService }): Promise<void> {
  let { db } = item;

  let rawData: QueryResult = await db.drizzle.execute(sql`
SELECT
  q.query_id
FROM queries as q
WHERE q.report_id is NULL
  AND to_timestamp(q.server_ts/1000) < (NOW() - INTERVAL '7 days')
  AND q.session_id IS NULL
`);

  let queryIds: string[] = rawData.rows.map((x: any) => x.query_id) || [];

  if (queryIds.length > 0) {
    await db.drizzle
      .delete(queriesTable)
      .where(inArray(queriesTable.queryId, queryIds));
  }
}
