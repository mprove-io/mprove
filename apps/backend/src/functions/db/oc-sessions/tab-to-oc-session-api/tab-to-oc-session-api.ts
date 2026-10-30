import type { OcSessionTab } from '#backend/drizzle/postgres/tables/oc-sessions';
import type { OcSessionApi } from '#common/types/backend/parts/session/oc-session-api';

export function tabToOcSessionApi(item: {
  ocSession: OcSessionTab;
}): OcSessionApi {
  let { ocSession } = item;

  return {
    sessionId: ocSession.sessionId,
    todos: ocSession.todos,
    questions: ocSession.questions,
    permissions: ocSession.permissions,
    ocSessionStatus: ocSession.ocSessionStatus,
    lastSessionError: ocSession.lastSessionError,
    isLastErrorRecovered: ocSession.isLastErrorRecovered
  };
}
