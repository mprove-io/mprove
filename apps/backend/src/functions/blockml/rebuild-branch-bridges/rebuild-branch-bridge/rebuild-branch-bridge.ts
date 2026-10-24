import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BackendConfig } from '#backend/config/backend-config';
import type { BridgeTab } from '#backend/drizzle/postgres/schema/_tabs';
import { rebuildStruct } from '#backend/functions/blockml/rebuild-struct/rebuild-struct';
import type { DbService } from '#backend/services/db/db.service';
import type { RpcService } from '#backend/services/rpc/rpc.service';
import type { TabService } from '#backend/services/tab/tab.service';
import { EMPTY_STRUCT_ID } from '#common/constants/top';
import { makeId } from '#common/functions/make-id/make-id';
import type { RebuildBranchBridgeError } from '#common/types/backend/function-errors/rebuild-branch-bridge-error';
import type { DiskCatalogFile } from '#common/types/disk/parts/catalog/disk-catalog-file';

export async function rebuildBranchBridge(item: {
  bridge: BridgeTab;
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
}): Result.ResultAsync<void, RebuildBranchBridgeError> {
  let { bridge, envId } = item;

  if (bridge.envId !== envId) {
    bridge.structId = EMPTY_STRUCT_ID;

    bridge.needValidate = true;

    return Result.succeed();
  }

  return Result.pipe(
    Result.succeed(item),
    Result.bind('structId', v => Result.succeed(makeId())),
    Result.andThrough(v =>
      rebuildStruct({
        traceId: v.traceId,
        orgId: v.orgId,
        projectId: v.projectId,
        repoId: v.repoId,
        structId: v.structId,
        diskFiles: v.diskFiles,
        mproveDir: v.mproveDir,
        envId: v.bridge.envId,
        selectedGivens: [],
        overrideTimezone: undefined,
        db: v.db,
        tabService: v.tabService,
        rpcService: v.rpcService,
        cs: v.cs,
        logger: v.logger
      })
    ),
    Result.map(v => {
      v.bridge.structId = v.structId;

      v.bridge.needValidate = false;

      return v;
    }),
    Result.map((v): void => undefined)
  );
}
