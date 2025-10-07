import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { ErEnum } from '~common/enums/er.enum';
import { isUndefined } from '~common/functions/is-undefined';
import { ServerError } from '~common/models/server-error';

@Injectable()
export class BridgesService {
  constructor(@Inject(DRIZZLE) private db: Db) {}

  async getBridgeCheckExists(item: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
  }) {
    let { projectId, repoId, branchId, envId } = item;

    let bridge = await this.db.drizzle.query.bridgesTable.findFirst({
      where: and(
        eq(bridgesTable.projectId, projectId),
        eq(bridgesTable.repoId, repoId),
        eq(bridgesTable.branchId, branchId),
        eq(bridgesTable.envId, envId)
      )
    });

    if (isUndefined(bridge)) {
      throw new ServerError({
        message: ErEnum.BACKEND_BRIDGE_BRANCH_ENV_DOES_NOT_EXIST
      });
    }

    return bridge;
  }
}
