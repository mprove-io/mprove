import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { isNotNull } from 'drizzle-orm';
import { dconfigsTable } from '#backend/drizzle/postgres/schema/dconfigs';
import { DbService } from '#backend/services/db/db.service';
import { ServerError } from '#common/classes/server-error/server-error';
import type { GetDconfigHashSecretError } from '#common/types/backend/function-errors/get-dconfig-hash-secret-error';

@Injectable()
export class DconfigsService {
  constructor(private db: DbService) {}

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
    return Result.pipe(
      Result.succeed({}),
      Result.bind('dconfig', v =>
        this.db.dconfigs.findFirst({
          where: isNotNull(dconfigsTable.dconfigId)
        })
      ),
      Result.map((v): string => v.dconfig?.hashSecret)
    );
  }
}
