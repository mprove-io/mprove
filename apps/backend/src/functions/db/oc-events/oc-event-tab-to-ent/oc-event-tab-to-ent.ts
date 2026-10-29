import { Result } from '@praha/byethrow';
import type {
  OcEventEnt,
  OcEventTab
} from '#backend/drizzle/postgres/tables/oc-events';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { OcEventLt } from '#common/types/shared/st-lt/oc-events/oc-event-lt';
import type { OcEventSt } from '#common/types/shared/st-lt/oc-events/oc-event-st';

export function ocEventTabToEnt(item: {
  tab: OcEventTab;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<OcEventEnt, never> {
  let { tab, tabService, isEncryptDb, isEncryptMetadata } = item;

  let eventSt: OcEventSt = {
    ocEvent: tab.ocEvent
  };

  let eventLt: OcEventLt = {};

  let ocEventEnt: OcEventEnt = {
    eventId: tab.eventId,
    sessionId: tab.sessionId,
    eventIndex: tab.eventIndex,
    type: tab.type,
    createdTs: tab.createdTs,
    serverTs: tab.serverTs,
    ...getEntProps({
      dataSt: eventSt,
      dataLt: eventLt,
      isMetadata: false,
      tabService: tabService,
      isEncryptDb: isEncryptDb,
      isEncryptMetadata: isEncryptMetadata
    })
  };

  return Result.succeed(ocEventEnt);
}
