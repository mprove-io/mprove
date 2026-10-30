import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { Options } from 'async-retry';
import { isNotNull, type SQLWrapper } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { BackendConfig } from '#backend/config/backend-config';
import { type DbExtra, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { schemaPostgres } from '#backend/drizzle/postgres/schema-postgres';
import {
  type DconfigEnt,
  dconfigsTable
} from '#backend/drizzle/postgres/tables/dconfigs';
import { customRetry } from '#backend/functions/custom-retry/custom-retry';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { makeTsNumber } from '#backend/functions/ts/make-ts-number/make-ts-number';
import { convertWritePack } from '#backend/services/db/convert-write-pack/convert-write-pack';
import {
  createDbTableRegistry,
  type DbTableRegistry
} from '#backend/services/db/create-db-table-registry';
import { dbTableKeys } from '#backend/services/db/db-entity-registry';
import { DbTableAccess } from '#backend/services/db/db-table-access';
import type { DbTableConversion } from '#backend/services/db/db-table-conversion';
import type { DbTransaction } from '#backend/services/db/db-transaction';
import { dbWriteOperationValues } from '#backend/services/db/db-write-operation';
import { rewriteTableRecords } from '#backend/services/db/rewrite-table-records/rewrite-table-records';
import { transaction } from '#backend/services/db/transaction/transaction';
import { writeDbTable } from '#backend/services/db/write-db-table/write-db-table';
import { TabService } from '#backend/services/tab/tab.service';
import type { DbTabsPack } from '#backend/types/db-tabs-pack';
import type { RewriteRecordsError } from '#backend/types/function-errors/rewrite-records-error';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { TxWriteError } from '#common/types/backend/function-errors/tx-write-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';

@Injectable()
export class DbService extends DbTableAccess {
  constructor(
    @Inject(DRIZZLE) private dbExtra: DbExtra,
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
  ) {
    let tableRegistry: DbTableRegistry = createDbTableRegistry({
      drizzle: dbExtra.drizzle,
      tabService: tabService
    });

    super({ tableRegistry: tableRegistry });
  }

  get drizzle(): NodePgDatabase<typeof schemaPostgres> {
    return this.dbExtra.drizzle;
  }

  async writeUnwrap(item: {
    insert?: DbTabsPack;
    update?: DbTabsPack;
    insertOrUpdate?: DbTabsPack;
    insertOrDoNothing?: DbTabsPack;
    rawQueries?: SQLWrapper[];
    serverTs?: number;
    retryOptions?: Options;
  }): Promise<void> {
    let {
      insert,
      update,
      insertOrUpdate,
      insertOrDoNothing,
      rawQueries,
      serverTs,
      retryOptions
    } = item;

    let result: Result.Result<void, WriteError> = await this.write({
      insert: insert,
      update: update,
      insertOrUpdate: insertOrUpdate,
      insertOrDoNothing: insertOrDoNothing,
      rawQueries: rawQueries,
      serverTs: serverTs,
      retryOptions: retryOptions
    });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }
  }

  async write(item: {
    insert?: DbTabsPack;
    update?: DbTabsPack;
    insertOrUpdate?: DbTabsPack;
    insertOrDoNothing?: DbTabsPack;
    rawQueries?: SQLWrapper[];
    serverTs?: number;
    retryOptions?: Options;
  }): Result.ResultAsync<void, WriteError> {
    let {
      insert,
      update,
      insertOrUpdate,
      insertOrDoNothing,
      rawQueries,
      serverTs,
      retryOptions
    } = item;

    return customRetry({
      options: retryOptions ?? getRetryOption(this.cs, this.logger),
      action: () =>
        transaction({
          drizzle: this.drizzle,
          action: tx =>
            this.txWrite({
              tx: tx,
              insert: insert,
              update: update,
              insertOrUpdate: insertOrUpdate,
              insertOrDoNothing: insertOrDoNothing,
              rawQueries: rawQueries,
              serverTs: serverTs
            })
        })
    });
  }

  async txWriteUnwrap(item: {
    tx: DbTransaction;
    insert?: DbTabsPack;
    update?: DbTabsPack;
    insertOrUpdate?: DbTabsPack;
    insertOrDoNothing?: DbTabsPack;
    rawQueries?: SQLWrapper[];
    serverTs?: number;
  }): Promise<void> {
    let {
      tx,
      insert,
      update,
      insertOrUpdate,
      insertOrDoNothing,
      rawQueries,
      serverTs
    } = item;

    let result: Result.Result<void, TxWriteError> = await this.txWrite({
      tx: tx,
      insert: insert,
      update: update,
      insertOrUpdate: insertOrUpdate,
      insertOrDoNothing: insertOrDoNothing,
      rawQueries: rawQueries,
      serverTs: serverTs
    });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }
  }

  async txWrite(item: {
    tx: DbTransaction;
    insert?: DbTabsPack;
    update?: DbTabsPack;
    insertOrUpdate?: DbTabsPack;
    insertOrDoNothing?: DbTabsPack;
    rawQueries?: SQLWrapper[];
    serverTs?: number;
  }): Result.ResultAsync<void, TxWriteError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind('dconfig', v =>
        v.tx.query.dconfigsTable
          .findFirst({ where: isNotNull(dconfigsTable.dconfigId) })
          .then((x: DconfigEnt) =>
            isUndefined(x)
              ? Result.succeed(undefined)
              : this.tableRegistry.dconfigs.entToTab({ ent: x })
          )
      ),
      Result.bind('activeWriteOperations', v =>
        Result.succeed(
          dbWriteOperationValues.filter(
            operation =>
              isDefined(v[operation]) && Object.keys(v[operation]).length > 0
          )
        )
      ),
      Result.bind('convertedPacks', v =>
        Result.sequence(v.activeWriteOperations, operation =>
          convertWritePack({
            operation: operation,
            tabsPack: v[operation],
            hashSecret: v.dconfig?.hashSecret,
            tableRegistry: this.tableRegistry
          })
        )
      ),
      Result.bind('newServerTs', v =>
        Result.succeed(isDefined(v.serverTs) ? v.serverTs : makeTsNumber())
      ),
      Result.map(v => {
        v.convertedPacks.forEach(convertedPack => {
          convertedPack.tableConversions.forEach(tableConversion => {
            tableConversion.ents.forEach(ent => {
              ent.serverTs = v.newServerTs;
            });
          });
        });
        return v;
      }),
      Result.andThrough(v =>
        Result.sequence(v.convertedPacks, convertedPack =>
          Result.sequence(
            convertedPack.tableConversions,
            (tableConversion: DbTableConversion) =>
              writeDbTable({
                tx: v.tx,
                tableConversion: tableConversion,
                operation: convertedPack.operation
              }).then(() => Result.succeed())
          )
        )
      ),
      Result.andThrough(v =>
        Result.sequence(v.rawQueries ?? [], (query: SQLWrapper) =>
          v.tx.execute(query).then(() => Result.succeed())
        )
      ),
      Result.map((v): void => undefined)
    );
  }

  async rewriteRecordsUnwrap(item: { isAllRecords: boolean }): Promise<void> {
    let { isAllRecords } = item;

    let result: Result.Result<void, RewriteRecordsError> =
      await this.rewriteRecords({ isAllRecords: isAllRecords });

    if (Result.isFailure(result)) {
      throw new ServerError({
        message: result.error.code,
        customData:
          'customData' in result.error ? result.error.customData : undefined
      });
    }
  }

  async rewriteRecords(item: {
    isAllRecords: boolean;
  }): Result.ResultAsync<void, RewriteRecordsError> {
    return Result.pipe(
      Result.succeed({
        ...item,
        startTs: Date.now()
      }),
      Result.inspect(v => {
        logToConsoleBackend({
          log: `DB rewrite started, isAllRecords: ${v.isAllRecords} ...`,
          logLevel: 'Info',
          logger: this.logger,
          cs: this.cs
        });
      }),
      Result.andThrough(v =>
        Result.sequence(dbTableKeys, key =>
          rewriteTableRecords({
            key: key,
            db: this,
            tableRegistry: this.tableRegistry,
            cs: this.cs,
            logger: this.logger,
            isAllRecords: v.isAllRecords,
            tabService: this.tabService
          })
        )
      ),
      Result.inspect(v => {
        logToConsoleBackend({
          log: `DB rewrite completed, total ${Date.now() - v.startTs} ms`,
          logLevel: 'Info',
          logger: this.logger,
          cs: this.cs
        });
      }),
      Result.map((v): void => undefined)
    );
  }
}
