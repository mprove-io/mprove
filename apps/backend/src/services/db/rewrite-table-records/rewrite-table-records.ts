import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  getTableName,
  inArray,
  isNotNull,
  isNull,
  lte,
  notInArray,
  or,
  type SQL,
  sql
} from 'drizzle-orm';
import type { AnyPgColumn, PgColumn, PgTable } from 'drizzle-orm/pg-core';
import type { BackendConfig } from '#backend/config/backend-config';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import type { DbTabsPack } from '#backend/interfaces/db-tabs-pack';
import type { DbTableRegistry } from '#backend/services/db/create-db-table-registry';
import type { DbService } from '#backend/services/db/db.service';
import {
  type DbEntityRegistry,
  type DbTableEnt,
  type DbTableKey,
  type DbTableReadError,
  type DbTableTab,
  dbEntityRegistry
} from '#backend/services/db/db-entity-registry';
import type { DbTable } from '#backend/services/db/db-table';
import type { TabService } from '#backend/services/tab/tab.service';
import type { RewriteTableRecordsError } from '#backend/types/function-errors/rewrite-table-records-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { WriteError } from '#common/types/backend/function-errors/write-error';

export async function rewriteTableRecords<Key extends DbTableKey>(item: {
  key: Key;
  db: DbService;
  tableRegistry: DbTableRegistry;
  cs: ConfigService<BackendConfig>;
  logger: Logger;
  isAllRecords: boolean;
  tabService: TabService;
}): Result.ResultAsync<void, RewriteTableRecordsError> {
  let { key, db, tableRegistry, cs, logger, isAllRecords, tabService } = item;

  let { keyTag, prevKeyTag, isEncryptDb, isEncryptMetadata } = tabService;

  let startTs: number = Date.now();

  let entityRegistry: DbEntityRegistry = dbEntityRegistry;

  let entityConfig: DbEntityRegistry[Key] = entityRegistry[key];

  if (entityConfig.encryptionPolicy === 'none') {
    return Result.succeed();
  }

  let table: PgTable = entityConfig.table;

  let columns: Record<string, PgColumn> = getTableColumns(table);

  let serverTsColumn: AnyPgColumn<{ data: number; notNull: true }> =
    entityConfig.table.serverTs;

  let tableAccess: DbTable<Key> = tableRegistry[key];

  let keyTags: string[] = isDefined(prevKeyTag)
    ? [keyTag, prevKeyTag]
    : [keyTag];

  let isEncrypt: boolean =
    isEncryptDb &&
    (entityConfig.encryptionPolicy === 'regular' || isEncryptMetadata);

  if (
    entityConfig.encryptionPolicy === 'metadata' &&
    isEncryptMetadata === false
  ) {
    let isEncryptedRecordExist: boolean = await tableAccess.isExistUnwrap({
      where: isNotNull(columns.keyTag)
    });

    if (isEncryptedRecordExist) {
      isAllRecords = true;
    }
  }

  let latestRecords: { serverTs: number }[] = await db.drizzle
    .select({ serverTs: sql<number>`${serverTsColumn}`.mapWith(Number) })
    .from(table)
    .orderBy(desc(serverTsColumn))
    .limit(1);

  if (latestRecords.length === 0) {
    return Result.succeed();
  }

  let latestServerTs: number = latestRecords[0].serverTs;

  let currentTs: number = Date.now();

  if (currentTs < latestServerTs) {
    return Result.fail({
      code: 'BACKEND_DB_SERVER_TS_IS_IN_FUTURE',
      customData: {
        table: getTableName(table),
        latestServerTs: latestServerTs,
        currentTs: currentTs
      }
    });
  }

  let serverTsWhere: SQL = lte(serverTsColumn, latestServerTs);

  let where: SQL =
    isAllRecords === true
      ? serverTsWhere
      : isEncrypt
        ? or(
            isNull(columns.keyTag),
            isDefined(prevKeyTag) ? eq(columns.keyTag, prevKeyTag) : undefined
          )
        : inArray(columns.keyTag, keyTags);

  while (true) {
    let recordEnts: Record<string, unknown>[] = await db.drizzle
      .select()
      .from(table)
      .where(where)
      .limit(1);

    let recordEnt: Record<string, unknown> = recordEnts[0];

    if (isUndefined(recordEnt)) {
      break;
    }

    // Dynamic SQL loses the key/entity correlation; both the table and its
    // converter come from the same registry entry at this boundary.
    let tabResult: Result.Result<
      DbTableTab<Key>,
      DbTableReadError<Key>
    > = tableAccess.entToTab({ ent: recordEnt as DbTableEnt<Key> });

    if (Result.isFailure(tabResult)) {
      return tabResult;
    }

    let update: DbTabsPack = { [key]: [tabResult.value] };

    let writeResult: Result.Result<void, WriteError> = await db.write({
      update: update
    });

    if (Result.isFailure(writeResult)) {
      return writeResult;
    }
  }

  let invalidKeyTagCounts: { count: number }[] = await db.drizzle
    .select({ count: count() })
    .from(table)
    .where(and(isNotNull(columns.keyTag), notInArray(columns.keyTag, keyTags)));

  if (invalidKeyTagCounts[0].count > 0) {
    return Result.fail({
      code: 'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
      customData: {
        table: getTableName(table),
        count: invalidKeyTagCounts[0].count
      }
    });
  }

  logToConsoleBackend({
    log: `DB rewrite - ${getTableName(table)}, ${Date.now() - startTs} ms`,
    logLevel: 'Info',
    logger: logger,
    cs: cs
  });

  return Result.succeed();
}
