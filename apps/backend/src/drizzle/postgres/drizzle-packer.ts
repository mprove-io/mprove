import { ExtractTablesWithRelations, SQLWrapper, eq } from 'drizzle-orm';
import { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { forEachSeries } from 'p-iteration';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { refreshServerTs } from '~backend/functions/refresh-server-ts';
import { drizzleSetAllColumnsFull } from './drizzle-set-all-columns-full';
import { setUndefinedToNull } from './drizzle-set-undefined-to-null';
import { usersTable } from './schema/users';

// let retry = require('async-retry');

export interface RecordsPack {
  tx: PgTransaction<
    NodePgQueryResultHKT,
    typeof schemaPostgres,
    ExtractTablesWithRelations<typeof schemaPostgres>
  >;
  insert?: interfaces.DbRecords;
  update?: interfaces.DbRecords;
  insertOrUpdate?: interfaces.DbRecords;
  rawQueries?: SQLWrapper[];
  serverTs?: number;
}

export interface RecordsPackOutput {
  insert?: interfaces.DbRecords;
  update?: interfaces.DbRecords;
  insertOrUpdate?: interfaces.DbRecords;
  rawQueries?: SQLWrapper[];
  serverTs?: number;
}

export class DrizzlePacker {
  constructor() {}

  async write(item: RecordsPack): Promise<RecordsPackOutput> {
    let {
      tx: tx,
      insert: insertRecords,
      update: updateRecords,
      insertOrUpdate: insertOrUpdateRecords,
      rawQueries: rawQueries,
      serverTs: serverTs
    } = item;

    let newServerTs = common.isDefined(serverTs) ? serverTs : makeTsNumber();

    if (common.isDefined(insertRecords)) {
      Object.keys(insertRecords).forEach(key => {
        if (
          common.isDefined(insertRecords[key as keyof interfaces.DbRecords])
        ) {
          refreshServerTs(
            insertRecords[key as keyof interfaces.DbRecords] as any,
            newServerTs
          );
        }
      });

      if (
        common.isDefined(insertRecords.users) &&
        insertRecords.users.length > 0
      ) {
        await tx.insert(usersTable).values(insertRecords.users);
      }
    }

    //
    //
    //

    if (common.isDefined(updateRecords)) {
      Object.keys(updateRecords).forEach(key => {
        if (
          common.isDefined(updateRecords[key as keyof interfaces.DbRecords])
        ) {
          refreshServerTs(
            updateRecords[key as keyof interfaces.DbRecords] as any,
            newServerTs
          );
        }
      });

      if (
        common.isDefined(updateRecords.users) &&
        updateRecords.users.length > 0
      ) {
        updateRecords.users = setUndefinedToNull({
          ents: updateRecords.users,
          table: usersTable
        });

        await forEachSeries(updateRecords.users, async x => {
          await tx
            .update(usersTable)
            .set(x)
            .where(eq(usersTable.userId, x.userId));
        });
      }
    }

    //
    //
    //

    if (common.isDefined(insertOrUpdateRecords)) {
      Object.keys(insertOrUpdateRecords).forEach(key => {
        if (
          common.isDefined(
            insertOrUpdateRecords[key as keyof interfaces.DbRecords]
          )
        ) {
          refreshServerTs(
            insertOrUpdateRecords[key as keyof interfaces.DbRecords] as any,
            newServerTs
          );
        }
      });

      if (
        common.isDefined(insertOrUpdateRecords.users) &&
        insertOrUpdateRecords.users.length > 0
      ) {
        insertOrUpdateRecords.users = setUndefinedToNull({
          ents: insertOrUpdateRecords.users,
          table: usersTable
        });

        await tx
          .insert(usersTable)
          .values(insertOrUpdateRecords.users)
          .onConflictDoUpdate({
            target: usersTable.userId,
            set: drizzleSetAllColumnsFull({ table: usersTable })
          });
      }
    }

    //
    //
    //

    if (common.isDefined(rawQueries)) {
      await forEachSeries(rawQueries, async x => {
        await tx.execute(x);
      });
    }

    let pack: RecordsPackOutput = {
      insert: insertRecords,
      update: updateRecords,
      insertOrUpdate: insertOrUpdateRecords
    };

    return pack;
  }
}
