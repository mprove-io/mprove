import { Result } from '@praha/byethrow';
import type { OcMessageTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { OcMessageEnt } from '#backend/drizzle/postgres/schema/oc-messages';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { OcMessageLt } from '#common/types/shared/st-lt/oc-messages/oc-message-lt';
import type { OcMessageSt } from '#common/types/shared/st-lt/oc-messages/oc-message-st';

export function ocMessageTabToEnt(item: {
  tab: OcMessageTab;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<OcMessageEnt, never> {
  let { tab, tabService, isEncryptDb, isEncryptMetadata } = item;

  let messageSt: OcMessageSt = {
    ocMessage: tab.ocMessage
  };

  let messageLt: OcMessageLt = {};

  let ocMessageEnt: OcMessageEnt = {
    messageId: tab.messageId,
    sessionId: tab.sessionId,
    role: tab.role,
    createdTs: tab.createdTs,
    serverTs: tab.serverTs,
    ...getEntProps({
      dataSt: messageSt,
      dataLt: messageLt,
      isMetadata: false,
      tabService: tabService,
      isEncryptDb: isEncryptDb,
      isEncryptMetadata: isEncryptMetadata
    })
  };

  return Result.succeed(ocMessageEnt);
}
