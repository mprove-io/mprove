import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BridgeTab } from '#backend/drizzle/postgres/schema/_tabs';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { DbService } from '#backend/services/db/db.service';
import { HashService } from '#backend/services/hash/hash.service';
import { EMPTY_STRUCT_ID } from '#common/constants/top';
import type { DbBridgesFindManyError } from '#common/types/backend/function-errors/db/bridges/db-bridges-find-many-error';
import type { GetBranchBridgesForRebuildError } from '#common/types/backend/function-errors/get-branch-bridges-for-rebuild-error';

@Injectable()
export class BridgesService {
  constructor(
    private hashService: HashService,
    private db: DbService
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

  async getBranchBridgesForRebuild(item: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
  }): Result.ResultAsync<BridgeTab[], GetBranchBridgesForRebuildError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'branchBridges',
        (v): Result.ResultAsync<BridgeTab[], DbBridgesFindManyError> =>
          this.db.bridges.findMany({
            where: and(
              eq(bridgesTable.projectId, v.projectId),
              eq(bridgesTable.repoId, v.repoId),
              eq(bridgesTable.branchId, v.branchId)
            )
          })
      ),
      Result.map((v): BridgeTab[] => {
        v.branchBridges.forEach(bridge => {
          if (bridge.envId !== v.envId) {
            bridge.structId = EMPTY_STRUCT_ID;
            bridge.needValidate = true;
          }
        });

        return v.branchBridges;
      })
    );
  }
}
