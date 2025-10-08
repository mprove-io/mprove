import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import {
  BridgeEnt,
  bridgesTable
} from '~backend/drizzle/postgres/schema/bridges';
import { ErEnum } from '~common/enums/er.enum';
import { isUndefined } from '~common/functions/is-undefined';
import { ServerError } from '~common/models/server-error';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class BridgesService {
  constructor(
    private tabService: TabService,
    private hashService: HashService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  makeBridgeEnt(item: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    structId: string;
    needValidate: boolean;
  }): BridgeEnt {
    let { projectId, repoId, branchId, envId, structId, needValidate } = item;

    let bridgeEnt: BridgeEnt = {
      bridgeFullId: this.hashService.makeBridgeFullId({
        projectId: projectId,
        repoId: repoId,
        branchId: branchId,
        envId: envId
      }),
      projectId: projectId,
      repoId: repoId,
      branchId: branchId,
      envId: envId,
      structId: structId,
      needValidate: needValidate,
      serverTs: undefined
    };

    return bridgeEnt;
  }

  async getBridgeEntCheckExists(item: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
  }): Promise<BridgeEnt> {
    let { projectId, repoId, branchId, envId } = item;

    let bridgeEnt = await this.db.drizzle.query.bridgesTable.findFirst({
      where: and(
        eq(bridgesTable.projectId, projectId),
        eq(bridgesTable.repoId, repoId),
        eq(bridgesTable.branchId, branchId),
        eq(bridgesTable.envId, envId)
      )
    });

    if (isUndefined(bridgeEnt)) {
      throw new ServerError({
        message: ErEnum.BACKEND_BRIDGE_BRANCH_ENV_DOES_NOT_EXIST
      });
    }

    return bridgeEnt;
  }
}
