import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { Options } from 'async-retry';
import type { SQLWrapper } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { BackendConfig } from '#backend/config/backend-config';
import { type DbExtra, DRIZZLE } from '#backend/drizzle/drizzle.module';
import {
  DrizzlePacker,
  type PackerOutput
} from '#backend/drizzle/postgres/drizzle-packer';
import type { schemaPostgres } from '#backend/drizzle/postgres/schema/_schema-postgres';
import { customRetry } from '#backend/functions/custom-retry/custom-retry';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import type { DbTabsPack } from '#backend/interfaces/db-tabs-pack';
import {
  createDbTableRegistry,
  type DbTableRegistry
} from '#backend/services/db/create-db-table-registry';
import type { DbTableContext } from '#backend/services/db/db-table';
import { DbTableAccess } from '#backend/services/db/db-table-access';
import { HashService } from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { WriteError } from '#common/types/backend/function-errors/write-error';

@Injectable()
export class DbService extends DbTableAccess {
  readonly packer: DrizzlePacker;

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

    this.packer = new DrizzlePacker({ tableRegistry: tableRegistry });
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
  }): Promise<PackerOutput> {
    let {
      insert,
      update,
      insertOrUpdate,
      insertOrDoNothing,
      rawQueries,
      serverTs,
      retryOptions
    } = item;

    let result: Result.Result<PackerOutput, WriteError> = await this.write({
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

    let output: PackerOutput = result.value;

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
  }): Result.ResultAsync<PackerOutput, WriteError> {
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
      action: async (): Result.ResultAsync<PackerOutput, WriteError> => {
        let rollbackSignal: Error & { cause?: WriteError } = new Error(
          'Transaction domain failure'
        );

        let state: { failure?: Result.Failure<WriteError> } = {};

        try {
          let success: Result.Success<PackerOutput> =
            await this.drizzle.transaction(
              async (tx): Promise<Result.Success<PackerOutput>> => {
                let result: Result.Result<PackerOutput, WriteError> =
                  await this.packer.write({
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
}
