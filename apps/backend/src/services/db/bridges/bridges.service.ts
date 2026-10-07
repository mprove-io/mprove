import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { BridgeTab } from '#backend/drizzle/postgres/schema/_tabs';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { HashService } from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';

@Injectable()
export class BridgesService {
  constructor(
    private tabService: TabService,
    private hashService: HashService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  makeBridge(item: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    structId: string;
    needValidate: boolean;
  }): BridgeTab {
    let { projectId, repoId, branchId, envId, structId, needValidate } = item;

    let bridge: BridgeTab = {
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
      keyTag: undefined,
      serverTs: undefined
    };

    return bridge;
  }

  async getBridgeCheckExists(item: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
  }): Promise<BridgeTab> {
    let { projectId, repoId, branchId, envId } = item;

    let bridge = await this.db.drizzle.query.bridgesTable
      .findFirst({
        where: and(
          eq(bridgesTable.projectId, projectId),
          eq(bridgesTable.repoId, repoId),
          eq(bridgesTable.branchId, branchId),
          eq(bridgesTable.envId, envId)
        )
      })
      .then(x => this.tabService.bridgeEntToTab(x));

    if (isUndefined(bridge)) {
      throw new ServerError({
        message: 'BACKEND_BRIDGE_BRANCH_ENV_DOES_NOT_EXIST'
      });
    }

    return bridge;
  }
}
