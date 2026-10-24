import { eq, getTableColumns } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import pIteration from 'p-iteration';
import { dbEntityRegistry } from '#backend/services/db/db-entity-registry';
import type { DbTableConversion } from '#backend/services/db/db-table-conversion';
import type { DbTransaction } from '#backend/services/db/db-transaction';
import type { DbWriteOperation } from '#backend/services/db/db-write-operation';
import { drizzleSetAllColumnsFull } from '#backend/services/db/write-db-table/drizzle-set-all-columns-full/drizzle-set-all-columns-full';
import { setUndefinedToNull } from '#backend/services/db/write-db-table/set-undefined-to-null/set-undefined-to-null';

const { forEachSeries } = pIteration;

export async function writeDbTable(item: {
  tx: DbTransaction;
  tableConversion: DbTableConversion;
  operation: DbWriteOperation;
}): Promise<void> {
  let { tx, tableConversion, operation } = item;

  // The correlated input checks table/entity pairing at the boundary. Keep
  // Drizzle's dynamic SQL implementation broad instead of expanding every table.
  let ents: Record<string, unknown>[] = tableConversion.ents;

  let table: PgTable = dbEntityRegistry[tableConversion.key].table;

  let identityKey: string = dbEntityRegistry[tableConversion.key].identityKey;

  if (ents.length === 0) {
    return;
  }

  if (operation === 'insert') {
    await tx.insert(table).values(ents);

    return;
  }

  let columns: Record<string, PgColumn> = getTableColumns(table);

  let identityColumn: PgColumn = columns[identityKey];

  if (operation === 'update') {
    let updateEnts: Record<string, unknown>[] = setUndefinedToNull({
      ents: ents,
      table: table
    });

    await forEachSeries(
      updateEnts,
      async (ent: Record<string, unknown>): Promise<void> => {
        await tx
          .update(table)
          .set(ent)
          .where(eq(identityColumn, ent[identityKey]));
      }
    );

    return;
  }

  // PostgreSQL cannot update the same conflict target twice in one insert.
  // Preserve the first occurrence, matching the previous packer behavior.
  let seenIds: Set<unknown> = new Set();

  let uniqueEnts: Record<string, unknown>[] = ents.filter(ent => {
    let id: unknown = ent[identityKey];

    if (seenIds.has(id)) {
      return false;
    }

    seenIds.add(id);

    return true;
  });

  let insertEnts: Record<string, unknown>[] = setUndefinedToNull({
    ents: uniqueEnts,
    table: table
  });

  if (operation === 'insertOrUpdate') {
    await tx
      .insert(table)
      .values(insertEnts)
      .onConflictDoUpdate({
        target: identityColumn,
        set: drizzleSetAllColumnsFull({ table: table })
      });

    return;
  }

  await tx.insert(table).values(insertEnts).onConflictDoNothing();
}
