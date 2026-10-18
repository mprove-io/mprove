import { Inject, Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { isNotNull } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { DconfigTab } from '#backend/drizzle/postgres/schema/_tabs';
import {
  type DconfigEnt,
  dconfigsTable
} from '#backend/drizzle/postgres/schema/dconfigs';
import { HashService } from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { DconfigEntToTabError } from '#common/types/backend/function-errors/dconfig-ent-to-tab-error';
import type { GetDconfigHashSecretError } from '#common/types/backend/function-errors/get-dconfig-hash-secret-error';

@Injectable()
export class DconfigsService {
  constructor(
    private hashService: HashService,
    private tabService: TabService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getDconfigHashSecretUnwrap(): Promise<string> {
    let result: Result.Result<string, GetDconfigHashSecretError> =
      await this.getDconfigHashSecret();

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let hashSecret: string = result.value;

    return hashSecret;
  }

  async getDconfigHashSecret(): Result.ResultAsync<
    string,
    GetDconfigHashSecretError
  > {
    let dconfigEnt: DconfigEnt =
      await this.db.drizzle.query.dconfigsTable.findFirst({
        where: isNotNull(dconfigsTable.dconfigId)
      });

    if (isUndefined(dconfigEnt)) {
      return Result.succeed(undefined);
    }

    return Result.pipe(
      Result.succeed({ dconfigEnt: dconfigEnt }),
      Result.bind(
        'dconfig',
        (v): Result.Result<DconfigTab, DconfigEntToTabError> =>
          this.tabService.dconfigEntToTab({
            dconfigEnt: v.dconfigEnt
          })
      ),
      Result.map((v): string => v.dconfig.hashSecret)
    );
  }
}
