import { Result } from '@praha/byethrow';
import type {
  StructEnt,
  StructTab
} from '#backend/drizzle/postgres/tables/structs';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { StructLt } from '#common/types/shared/st-lt/structs/struct-lt';
import type { StructSt } from '#common/types/shared/st-lt/structs/struct-st';

export function structTabToEnt(item: {
  tab: StructTab;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<StructEnt, never> {
  let { tab, tabService, isEncryptDb, isEncryptMetadata } = item;

  let structSt: StructSt = {};

  let structLt: StructLt = {
    errors: tab.errors,
    modelFilePaths: tab.modelFilePaths ?? [],
    metrics: tab.metrics,
    presets: tab.presets,
    spaces: tab.spaces,
    extraSchemas: tab.extraSchemas,
    mproveConfig: tab.mproveConfig,
    mproveExplorer: tab.mproveExplorer
  };

  let structEnt: StructEnt = {
    structId: tab.structId,
    projectId: tab.projectId,
    mproveVersion: tab.mproveVersion,
    serverTs: tab.serverTs,
    ...getEntProps({
      dataSt: structSt,
      dataLt: structLt,
      isMetadata: true,
      tabService: tabService,
      isEncryptDb: isEncryptDb,
      isEncryptMetadata: isEncryptMetadata
    })
  };

  return Result.succeed(structEnt);
}
