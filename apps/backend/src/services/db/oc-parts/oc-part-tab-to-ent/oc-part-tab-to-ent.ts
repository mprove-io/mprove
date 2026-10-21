import { Result } from '@praha/byethrow';
import type { OcPartTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { OcPartEnt } from '#backend/drizzle/postgres/schema/oc-parts';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { OcPartLt } from '#common/types/shared/st-lt/oc-parts/oc-part-lt';
import type { OcPartSt } from '#common/types/shared/st-lt/oc-parts/oc-part-st';

export function ocPartTabToEnt(item: {
  tab: OcPartTab;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<OcPartEnt, never> {
  let { tab, tabService, isEncryptDb, isEncryptMetadata } = item;

  let partSt: OcPartSt = {
    ocPart: tab.ocPart
  };

  let partLt: OcPartLt = {};

  let ocPartEnt: OcPartEnt = {
    partId: tab.partId,
    messageId: tab.messageId,
    sessionId: tab.sessionId,
    type: tab.type,
    createdTs: tab.createdTs,
    serverTs: tab.serverTs,
    ...getEntProps({
      dataSt: partSt,
      dataLt: partLt,
      isMetadata: false,
      tabService: tabService,
      isEncryptDb: isEncryptDb,
      isEncryptMetadata: isEncryptMetadata
    })
  };

  return Result.succeed(ocPartEnt);
}
