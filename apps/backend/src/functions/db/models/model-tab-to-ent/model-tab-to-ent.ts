import { Result } from '@praha/byethrow';
import type {
  ModelEnt,
  ModelTab
} from '#backend/drizzle/postgres/tables/models';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import { makeModelFullId } from '#backend/functions/hash/make-model-full-id/make-model-full-id';
import type { TabService } from '#backend/services/tab/tab.service';
import type { ModelLt } from '#common/types/shared/st-lt/models/model-lt';
import type { ModelSt } from '#common/types/shared/st-lt/models/model-st';

export function modelTabToEnt(item: {
  tab: ModelTab;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<ModelEnt, never> {
  let { tab, tabService, isEncryptDb, isEncryptMetadata } = item;

  let modelSt: ModelSt = {
    accessRoles: tab.accessRoles,
    accessRolesCombined: tab.accessRolesCombined,
    source: tab.source,
    filePath: tab.filePath,
    space: tab.space,
    spaceFullTitle: tab.spaceFullTitle,
    label: tab.label
  };

  let modelLt: ModelLt = {
    malloyModelDef: tab.malloyModelDef,
    fileText: tab.fileText,
    storeContent: tab.storeContent,
    dateRangeIncludesRightSide: tab.dateRangeIncludesRightSide,
    fields: tab.fields,
    nodes: tab.nodes
  };

  let modelEnt: ModelEnt = {
    modelFullId: makeModelFullId({
      structId: tab.structId,
      modelId: tab.modelId
    }),
    structId: tab.structId,
    modelId: tab.modelId,
    type: tab.type,
    connectionId: tab.connectionId,
    connectionType: tab.connectionType,
    serverTs: tab.serverTs,
    ...getEntProps({
      dataSt: modelSt,
      dataLt: modelLt,
      isMetadata: true,
      tabService: tabService,
      isEncryptDb: isEncryptDb,
      isEncryptMetadata: isEncryptMetadata
    })
  };

  return Result.succeed(modelEnt);
}
