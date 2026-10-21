import { Result } from '@praha/byethrow';
import type { OcSessionTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { OcSessionEnt } from '#backend/drizzle/postgres/schema/oc-sessions';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { OcSessionLt } from '#common/types/shared/st-lt/oc-sessions/oc-session-lt';
import type { OcSessionSt } from '#common/types/shared/st-lt/oc-sessions/oc-session-st';

export function ocSessionTabToEnt(item: {
  tab: OcSessionTab;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<OcSessionEnt, never> {
  let { tab, tabService, isEncryptDb, isEncryptMetadata } = item;

  let ocSessionSt: OcSessionSt = {
    openSession: tab.openSession,
    todos: tab.todos,
    questions: tab.questions,
    permissions: tab.permissions,
    ocSessionStatus: tab.ocSessionStatus,
    lastSessionError: tab.lastSessionError,
    isLastErrorRecovered: tab.isLastErrorRecovered
  };

  let ocSessionLt: OcSessionLt = {};

  let ocSessionEnt: OcSessionEnt = {
    sessionId: tab.sessionId,
    serverTs: tab.serverTs,
    ...getEntProps({
      dataSt: ocSessionSt,
      dataLt: ocSessionLt,
      isMetadata: false,
      tabService: tabService,
      isEncryptDb: isEncryptDb,
      isEncryptMetadata: isEncryptMetadata
    })
  };

  return Result.succeed(ocSessionEnt);
}
