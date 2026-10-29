import type { OcSessionTab } from '#backend/drizzle/postgres/tables/oc-sessions';

export function makeOcSession(item: { sessionId: string }): OcSessionTab {
  let ocSession: OcSessionTab = {
    sessionId: item.sessionId,
    serverTs: undefined,
    keyTag: undefined
  };

  return ocSession;
}
