import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BackendConfig } from '#backend/config/backend-config';
import type { BridgeTab } from '#backend/drizzle/postgres/tables/bridges';
import { rebuildBlockmlBranchBridge } from '#backend/functions/blockml/rebuild-blockml-branch-bridges/rebuild-blockml-branch-bridge/rebuild-blockml-branch-bridge';
import type { DbService } from '#backend/services/db/db.service';
import type { RpcService } from '#backend/services/rpc/rpc.service';
import type { TabService } from '#backend/services/tab/tab.service';
import type { RebuildBlockmlBranchBridgeError } from '#common/types/backend/function-errors/rebuild-blockml-branch-bridge-error';
import type { RebuildBlockmlBranchBridgesError } from '#common/types/backend/function-errors/rebuild-blockml-branch-bridges-error';
import type { DiskCatalogFile } from '#common/types/disk/parts/catalog/disk-catalog-file';

export async function rebuildBlockmlBranchBridges(item: {
  branchBridges: BridgeTab[];
  envId: string;
  traceId: string;
  orgId: string;
  projectId: string;
  repoId: string;
  diskFiles: DiskCatalogFile[];
  mproveDir: string;
  db: DbService;
  tabService: TabService;
  rpcService: RpcService;
  cs: ConfigService<BackendConfig>;
  logger: Logger;
}): Result.ResultAsync<void, RebuildBlockmlBranchBridgesError> {
  return Result.pipe(
    Result.succeed(item),
    Result.andThrough(v =>
      Result.sequence(
        v.branchBridges,
        (
          bridge: BridgeTab
        ): Result.ResultAsync<void, RebuildBlockmlBranchBridgeError> =>
          rebuildBlockmlBranchBridge({
            bridge: bridge,
            envId: v.envId,
            traceId: v.traceId,
            orgId: v.orgId,
            projectId: v.projectId,
            repoId: v.repoId,
            diskFiles: v.diskFiles,
            mproveDir: v.mproveDir,
            db: v.db,
            tabService: v.tabService,
            rpcService: v.rpcService,
            cs: v.cs,
            logger: v.logger
          })
      )
    ),
    Result.map((v): void => undefined)
  );
}
