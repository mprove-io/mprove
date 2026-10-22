import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { Options } from 'async-retry';
import { isNotNull, type SQLWrapper } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import pIteration from 'p-iteration';
import type { BackendConfig } from '#backend/config/backend-config';
import { type DbExtra, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { schemaPostgres } from '#backend/drizzle/postgres/schema/_schema-postgres';
import {
  type DconfigEnt,
  dconfigsTable
} from '#backend/drizzle/postgres/schema/dconfigs';
import { customRetry } from '#backend/functions/custom-retry/custom-retry';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import type { DbEntsPack } from '#backend/interfaces/db-ents-pack';
import type { DbTabsPack } from '#backend/interfaces/db-tabs-pack';
import {
  createDbTableRegistry,
  type DbTableRegistry
} from '#backend/services/db/create-db-table-registry';
import {
  type DbTableEnt,
  type DbWriteTableKey,
  dbTableKeys
} from '#backend/services/db/db-entity-registry';
import type { DbTableContext } from '#backend/services/db/db-table';
import { DbTableAccess } from '#backend/services/db/db-table-access';
import type { DbTransaction } from '#backend/services/db/db-transaction';
import {
  type DbWriteOperation,
  dbWriteOperationValues
} from '#backend/services/db/db-write-operation';
import { tabsPackToEntsPack } from '#backend/services/db/tx-write/tabs-pack-to-ents-pack/tabs-pack-to-ents-pack';
import { writeDbPack } from '#backend/services/db/tx-write/write-db-pack/write-db-pack';
import type { WriteOutput } from '#backend/services/db/write-output';
import { HashService } from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { TxWriteError } from '#common/types/backend/function-errors/tx-write-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';

const { forEachSeries } = pIteration;

type WriteEntPack = {
  [Operation in DbWriteOperation]?: DbEntsPack;
};

@Injectable()
export class DbService extends DbTableAccess {
  constructor(
    @Inject(DRIZZLE) private dbExtra: DbExtra,
    hashService: HashService,
    tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
  ) {
    let context: DbTableContext = {
      hashService: hashService,
      tabService: tabService,
      isEncryptDb: cs.get<BackendConfig['isEncryptDb']>('isEncryptDb'),
      isEncryptMetadata:
        cs.get<BackendConfig['isEncryptMetadata']>('isEncryptMetadata')
    };

    let tableRegistry: DbTableRegistry = createDbTableRegistry({
      dbExtra: dbExtra,
      context: context
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
  }): Promise<WriteOutput> {
    let {
      insert,
      update,
      insertOrUpdate,
      insertOrDoNothing,
      rawQueries,
      serverTs,
      retryOptions
    } = item;

    let result: Result.Result<WriteOutput, WriteError> = await this.write({
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

    let output: WriteOutput = result.value;

    return output;
  }

  async write(item: {
    insert?: DbTabsPack;
    update?: DbTabsPack;
    insertOrUpdate?: DbTabsPack;
    insertOrDoNothing?: DbTabsPack;
    rawQueries?: SQLWrapper[];
    serverTs?: number;
    retryOptions?: Options;
  }): Result.ResultAsync<WriteOutput, WriteError> {
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
      action: async (): Result.ResultAsync<WriteOutput, WriteError> => {
        let rollbackSignal: Error & { cause?: WriteError } = new Error(
          'Transaction domain failure'
        );

        let state: { failure?: Result.Failure<WriteError> } = {};

        try {
          let success: Result.Success<WriteOutput> =
            await this.drizzle.transaction(
              async (tx): Promise<Result.Success<WriteOutput>> => {
                let result: Result.Result<WriteOutput, WriteError> =
                  await this.txWrite({
                    tx: tx,
                    insert: insert,
                    update: update,
                    insertOrUpdate: insertOrUpdate,
                    insertOrDoNothing: insertOrDoNothing,
                    rawQueries: rawQueries,
                    serverTs: serverTs
                  });

                if (Result.isFailure(result)) {
                  state.failure = result;

                  rollbackSignal.cause = result.error;

                  throw rollbackSignal;
                }

                return result;
              }
            );

          return success;
        } catch (error: unknown) {
          if (error === rollbackSignal && isDefined(state.failure)) {
            return state.failure;
          }

          throw error;
        }
      }
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
  }): Promise<WriteOutput> {
    let {
      tx,
      insert,
      update,
      insertOrUpdate,
      insertOrDoNothing,
      rawQueries,
      serverTs
    } = item;

    let result: Result.Result<WriteOutput, TxWriteError> = await this.txWrite({
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

    let output: WriteOutput = result.value;

    return output;
  }

  async txWrite(item: {
    tx: DbTransaction;
    insert?: DbTabsPack;
    update?: DbTabsPack;
    insertOrUpdate?: DbTabsPack;
    insertOrDoNothing?: DbTabsPack;
    rawQueries?: SQLWrapper[];
    serverTs?: number;
  }): Result.ResultAsync<WriteOutput, TxWriteError> {
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
      Result.bind('insertEntsPack', v =>
        isDefined(v.insert) && Object.keys(v.insert).length > 0
          ? tabsPackToEntsPack({
              tabsPack: v.insert,
              hashSecret: v.dconfig?.hashSecret,
              tableRegistry: this.tableRegistry
            })
          : Result.succeed(undefined)
      ),
      Result.bind('updateEntsPack', v =>
        isDefined(v.update) && Object.keys(v.update).length > 0
          ? tabsPackToEntsPack({
              tabsPack: v.update,
              hashSecret: v.dconfig?.hashSecret,
              tableRegistry: this.tableRegistry
            })
          : Result.succeed(undefined)
      ),
      Result.bind('insertOrUpdateEntsPack', v =>
        isDefined(v.insertOrUpdate) && Object.keys(v.insertOrUpdate).length > 0
          ? tabsPackToEntsPack({
              tabsPack: v.insertOrUpdate,
              hashSecret: v.dconfig?.hashSecret,
              tableRegistry: this.tableRegistry
            })
          : Result.succeed(undefined)
      ),
      Result.bind('insertOrDoNothingEntsPack', v =>
        isDefined(v.insertOrDoNothing) &&
        Object.keys(v.insertOrDoNothing).length > 0
          ? tabsPackToEntsPack({
              tabsPack: v.insertOrDoNothing,
              hashSecret: v.dconfig?.hashSecret,
              tableRegistry: this.tableRegistry
            })
          : Result.succeed(undefined)
      ),
      Result.bind('newServerTs', v =>
        Result.succeed(isDefined(v.serverTs) ? v.serverTs : makeTsNumber())
      ),
      Result.map(v => {
        [
          v.insertEntsPack,
          v.updateEntsPack,
          v.insertOrUpdateEntsPack,
          v.insertOrDoNothingEntsPack
        ].forEach(entsPack => {
          if (isDefined(entsPack)) {
            dbTableKeys.forEach(key => {
              entsPack[key]?.forEach((ent: DbTableEnt<DbWriteTableKey>) => {
                ent.serverTs = v.newServerTs;
              });
            });
          }
        });
        return v;
      }),
      Result.andThrough(async v => {
        let writeEntPack: WriteEntPack = {
          insert: v.insertEntsPack,
          update: v.updateEntsPack,
          insertOrUpdate: v.insertOrUpdateEntsPack,
          insertOrDoNothing: v.insertOrDoNothingEntsPack
        };

        await forEachSeries(
          [...dbWriteOperationValues],
          async (operation: DbWriteOperation): Promise<void> => {
            let entsPack: DbEntsPack = writeEntPack[operation];

            if (isDefined(entsPack)) {
              await writeDbPack({
                tx: v.tx,
                entsPack: entsPack,
                operation: operation
              });
            }
          }
        );

        return Result.succeed();
      }),
      Result.andThrough(async v => {
        if (isDefined(v.rawQueries)) {
          await forEachSeries(
            v.rawQueries,
            async (query: SQLWrapper): Promise<void> => {
              await v.tx.execute(query);
            }
          );
        }
        return Result.succeed();
      }),
      Result.map(
        (v): WriteOutput => ({
          insert: v.insert,
          update: v.update,
          insertOrUpdate: v.insertOrUpdate,
          insertOrDoNothing: v.insertOrDoNothing
        })
      )
    );
  }
}
