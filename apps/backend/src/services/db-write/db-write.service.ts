import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Result } from '@praha/byethrow';
import type { SQLWrapper } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { PackerOutput } from '#backend/drizzle/postgres/drizzle-packer';
import { retryTransactionResult } from '#backend/functions/retry-transaction-result/retry-transaction-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import type { DbTabsPack } from '#backend/interfaces/db-tabs-pack';
import type { WriteError } from '#common/types/backend/function-errors/write-error';

@Injectable()
export class DbWriteService {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async writeResult(item: {
    insert?: DbTabsPack;
    update?: DbTabsPack;
    insertOrUpdate?: DbTabsPack;
    insertOrDoNothing?: DbTabsPack;
    rawQueries?: SQLWrapper[];
    serverTs?: number;
  }): Result.ResultAsync<PackerOutput, WriteError> {
    let {
      insert,
      update,
      insertOrUpdate,
      insertOrDoNothing,
      rawQueries,
      serverTs
    } = item;

    return retryTransactionResult({
      db: this.db,
      options: getRetryOption(this.cs, this.logger),
      action: ({ tx }) =>
        this.db.packer.writeResult({
          tx: tx,
          insert: insert,
          update: update,
          insertOrUpdate: insertOrUpdate,
          insertOrDoNothing: insertOrDoNothing,
          rawQueries: rawQueries,
          serverTs: serverTs
        })
    });
  }
}
