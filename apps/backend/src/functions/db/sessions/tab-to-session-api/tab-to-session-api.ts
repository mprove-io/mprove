import type {
  OcSessionTab,
  SessionTab
} from '#backend/drizzle/postgres/schema/_tabs';
import type { SessionApi } from '#common/types/backend/parts/session/session-api';

export function tabToSessionApi(item: {
  session: SessionTab;
  ocSession?: OcSessionTab;
}): SessionApi {
  let { session, ocSession } = item;

  return {
    sessionId: session.sessionId,
    type: session.type,
    repoId: session.repoId,
    branchId: session.branchId,
    providerId: session.providerId,
    agent: session.agent,
    modelId: session.modelId,
    lastMessageVariant: session.lastMessageVariant,
    status: session.status,
    archiveReason: session.archiveReason,
    pauseReason: session.pauseReason,
    initialBranch: session.initialBranch,
    envId: session.envId,
    initialCommit: session.initialCommit,
    createdTs: session.createdTs,
    lastActivityTs: session.lastActivityTs,
    firstMessage: session.firstMessage,
    title: ocSession?.openSession?.title,
    opencodeSessionId: session.opencodeSessionId,
    closedExplorerTabIds: session.closedExplorerTabIds
  };
}
