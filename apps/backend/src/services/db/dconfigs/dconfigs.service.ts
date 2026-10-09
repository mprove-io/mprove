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
import type { DconfigEntToTabResultError } from '#common/types/backend/function-errors/dconfig-ent-to-tab-result-error';
import type { GetDconfigHashSecretResultError } from '#common/types/backend/function-errors/get-dconfig-hash-secret-result-error';

@Injectable()
export class DconfigsService {
  constructor(
    private hashService: HashService,
    private tabService: TabService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getDconfigHashSecret(): Promise<string> {
    let result: Result.Result<string, GetDconfigHashSecretResultError> =
      await this.getDconfigHashSecretResult();

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let hashSecret: string = result.value;

    return hashSecret;
  }

  async getDconfigHashSecretResult(): Result.ResultAsync<
    string,
    GetDconfigHashSecretResultError
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
        (v): Result.Result<DconfigTab, DconfigEntToTabResultError> =>
          this.tabService.dconfigEntToTabResult({
            dconfigEnt: v.dconfigEnt
          })
      ),
      Result.map((v): string => v.dconfig.hashSecret)
    );
  }
}
