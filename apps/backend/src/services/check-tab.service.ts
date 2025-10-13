import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, isNotNull, isNull, notInArray, or, sql } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { avatarsTable } from '~backend/drizzle/postgres/schema/avatars';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { BoolEnum } from '~common/enums/bool.enum';
import { ErEnum } from '~common/enums/er.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { ServerError } from '~common/models/server-error';
import { AvatarsService } from './db/avatars.service';

let retry = require('async-retry');

@Injectable()
export class CheckTabService {
  private keyTag: string;
  private prevKeyTag: string;
  private keyTags: string[];
  private isEncryption: boolean;

  constructor(
    private avatarsService: AvatarsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {
    this.keyTag = this.cs.get<BackendConfig['aesKeyTag']>('aesKeyTag');

    this.prevKeyTag =
      this.cs.get<BackendConfig['prevAesKeyTag']>('prevAesKeyTag');

    this.keyTags = isDefined(this.prevKeyTag)
      ? [this.keyTag, this.prevKeyTag]
      : [this.keyTag];

    this.isEncryption =
      this.cs.get<BackendConfig['isDbEncryptionEnabled']>(
        'isDbEncryptionEnabled'
      ) === BoolEnum.TRUE;
  }

  async checkAvatars() {
    let where =
      this.isEncryption === true
        ? or(
            isNull(avatarsTable.keyTag),
            eq(avatarsTable.keyTag, this.prevKeyTag)
          )
        : or(
            eq(avatarsTable.keyTag, this.keyTag),
            eq(avatarsTable.keyTag, this.prevKeyTag)
          );

    while (true) {
      let avatar = await this.db.drizzle.query.avatarsTable
        .findFirst({ where: where })
        .then(x => this.avatarsService.entToTab(x));

      if (isUndefined(avatar)) {
        break;
      }

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                insertOrUpdate: {
                  avatars: [avatar]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    let avatarsResult = await this.db.drizzle
      .select({
        record: avatarsTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(avatarsTable)
      .where(
        and(
          isNotNull(avatarsTable.keyTag),
          notInArray(avatarsTable.keyTag, this.keyTags)
        )
      );

    if (avatarsResult.length > 0 && avatarsResult[0].total > 0) {
      throw new ServerError({
        message:
          ErEnum.BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV,
        customData: {
          table: 'avatars',
          count: avatarsResult[0].total
        }
      });
    }
  }
}
