import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import {
  BridgeEnt,
  bridgesTable
} from '~backend/drizzle/postgres/schema/bridges';
import {
  BridgeLt,
  BridgeSt,
  BridgeTab
} from '~backend/drizzle/postgres/tabs/bridge-tab';
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

  entToTab(bridgeEnt: BridgeEnt): BridgeTab {
    if (isUndefined(bridgeEnt)) {
      return;
    }

    let bridge: BridgeTab = {
      ...bridgeEnt,
      ...this.tabService.decrypt<BridgeSt>({
        encryptedString: bridgeEnt.st
      }),
      ...this.tabService.decrypt<BridgeLt>({
        encryptedString: bridgeEnt.lt
      })
    };

    return bridge;
  }

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
      .then(x => this.entToTab(x));

    if (isUndefined(bridge)) {
      throw new ServerError({
        message: ErEnum.BACKEND_BRIDGE_BRANCH_ENV_DOES_NOT_EXIST
      });
    }

    return bridge;
  }
}
