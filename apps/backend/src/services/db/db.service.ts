import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Result } from '@praha/byethrow';
import type { SQLWrapper } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { PackerOutput } from '#backend/drizzle/postgres/drizzle-packer';
import type {
  AvatarTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import type { AvatarEnt } from '#backend/drizzle/postgres/schema/avatars';
import type { UserEnt } from '#backend/drizzle/postgres/schema/users';
import { retryTransactionResult } from '#backend/functions/retry-transaction-result/retry-transaction-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import type { DbTabsPack } from '#backend/interfaces/db-tabs-pack';
import {
  createDbReader,
  type DbReader
} from '#backend/services/db/create-db-reader/create-db-reader';
import { TabService } from '#backend/services/tab/tab.service';
import type { AvatarEntToTabError } from '#common/types/backend/function-errors/avatar-ent-to-tab-error';
import type { UserEntToTabError } from '#common/types/backend/function-errors/user-ent-to-tab-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';

@Injectable()
export class DbService {
  readonly avatars: DbReader<'avatarsTable', AvatarTab, AvatarEntToTabError>;

  readonly users: DbReader<'usersTable', UserTab, UserEntToTabError>;

  constructor(
    @Inject(DRIZZLE) private db: Db,
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
  ) {
    this.avatars = createDbReader<
      'avatarsTable',
      AvatarEnt,
      AvatarTab,
      AvatarEntToTabError
    >({
      findFirst: item => this.db.drizzle.query.avatarsTable.findFirst(item),
      findMany: item => this.db.drizzle.query.avatarsTable.findMany(item),
      convert: avatarEnt =>
        this.tabService.avatarEntToTab({ avatarEnt: avatarEnt })
    });

    this.users = createDbReader<
      'usersTable',
      UserEnt,
      UserTab,
      UserEntToTabError
    >({
      findFirst: item => this.db.drizzle.query.usersTable.findFirst(item),
      findMany: item => this.db.drizzle.query.usersTable.findMany(item),
      convert: userEnt => this.tabService.userEntToTab({ userEnt: userEnt })
    });
  }

  async write(item: {
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
        this.db.packer.write({
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
