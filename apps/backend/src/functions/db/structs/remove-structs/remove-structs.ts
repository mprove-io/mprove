import { and, inArray, isNull, sql } from 'drizzle-orm';
import { chartsTable } from '#backend/drizzle/postgres/tables/charts';
import { dashboardsTable } from '#backend/drizzle/postgres/tables/dashboards';
import { kitsTable } from '#backend/drizzle/postgres/tables/kits';
import { mconfigsTable } from '#backend/drizzle/postgres/tables/mconfigs';
import { modelFieldLeafsTable } from '#backend/drizzle/postgres/tables/model-field-leafs';
import { modelsTable } from '#backend/drizzle/postgres/tables/models';
import { queriesTable } from '#backend/drizzle/postgres/tables/queries';
import { reportsTable } from '#backend/drizzle/postgres/tables/reports';
import { structsTable } from '#backend/drizzle/postgres/tables/structs';
import type { DbService } from '#backend/services/db/db.service';
import { EMPTY_STRUCT_ID } from '#common/constants/top';

export async function removeStructs(item: { db: DbService }): Promise<void> {
  let { db } = item;

  let rawData: any = await db.drizzle.execute(sql`
SELECT
  s.struct_id,
  b.project_id,
  b.repo_id,
  b.branch_id,
  b.env_id
FROM structs AS s
LEFT JOIN bridges AS b ON s.struct_id = b.struct_id
LEFT JOIN branches AS c ON b.branch_id = c.branch_id
WHERE c.branch_id IS NULL AND to_timestamp(s.server_ts/1000) < (NOW() - INTERVAL '15 seconds');
`);

  let structIds: string[] = rawData.rows.map((x: any) => x.struct_id) || [];

  structIds = structIds.filter(x => [EMPTY_STRUCT_ID].indexOf(x) < 0);

  if (structIds.length > 0) {
    await db.drizzle
      .delete(structsTable)
      .where(inArray(structsTable.structId, structIds));

    await db.drizzle
      .delete(modelsTable)
      .where(inArray(modelsTable.structId, structIds));

    await db.drizzle
      .delete(modelFieldLeafsTable)
      .where(inArray(modelFieldLeafsTable.structId, structIds));

    await db.drizzle
      .delete(chartsTable)
      .where(
        and(
          inArray(chartsTable.structId, structIds),
          isNull(chartsTable.sessionId)
        )
      );

    await db.drizzle
      .delete(dashboardsTable)
      .where(inArray(dashboardsTable.structId, structIds));

    await db.drizzle
      .delete(reportsTable)
      .where(inArray(reportsTable.structId, structIds));

    await db.drizzle
      .delete(kitsTable)
      .where(inArray(kitsTable.structId, structIds));

    await db.drizzle
      .delete(mconfigsTable)
      .where(
        and(
          inArray(mconfigsTable.structId, structIds),
          isNull(mconfigsTable.sessionId)
        )
      );

    await db.drizzle
      .delete(queriesTable)
      .where(
        and(
          inArray(queriesTable.reportStructId, structIds),
          isNull(queriesTable.sessionId)
        )
      );
  }
}
