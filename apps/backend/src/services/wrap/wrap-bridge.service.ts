import { Injectable } from '@nestjs/common';
import { BridgeEnt } from '~backend/drizzle/postgres/schema/bridges';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class WrapBridgeService {
  constructor(
    private tabService: TabService,
    private hashService: HashService
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

    let bridge: BridgeEnt = {
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
}
