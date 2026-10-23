import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BridgeTab } from '#backend/drizzle/postgres/schema/_tabs';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import type { DbService } from '#backend/services/db/db.service';
import { EMPTY_STRUCT_ID } from '#common/constants/top';
import type { GetBranchBridgesForRebuildError } from '#common/types/backend/function-errors/get-branch-bridges-for-rebuild-error';

export async function getBranchBridgesForRebuild(item: {
  db: DbService;
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
}): Result.ResultAsync<BridgeTab[], GetBranchBridgesForRebuildError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('branchBridges', v =>
      v.db.bridges.findMany({
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
