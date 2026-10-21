import { Result } from '@praha/byethrow';
import type { SessionTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { SessionEnt } from '#backend/drizzle/postgres/schema/sessions';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { SessionLt } from '#common/types/shared/st-lt/sessions/session-lt';
import type { SessionSt } from '#common/types/shared/st-lt/sessions/session-st';

export function sessionTabToEnt(item: {
  tab: SessionTab;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<SessionEnt, never> {
  let { tab, tabService, isEncryptDb, isEncryptMetadata } = item;

  let sessionSt: SessionSt = {
    sandboxId: tab.sandboxId,
    sandboxBaseUrl: tab.sandboxBaseUrl,
    opencodeSessionId: tab.opencodeSessionId,
    opencodePassword: tab.opencodePassword,
    firstMessage: tab.firstMessage,
    apiKeySecretHash: tab.apiKeySecretHash,
    apiKeySalt: tab.apiKeySalt,
    providerConfigHash: tab.providerConfigHash,
    closedExplorerTabIds: tab.closedExplorerTabIds
  };

  let sessionLt: SessionLt = {};

  let sessionEnt: SessionEnt = {
    sessionId: tab.sessionId,
    type: tab.type,
    repoId: tab.repoId,
    branchId: tab.branchId,
    userId: tab.userId,
    projectId: tab.projectId,
    apiKeyPrefix: tab.apiKeyPrefix,
    modelId: tab.modelId,
    lastMessageVariant: tab.lastMessageVariant,
    sandboxType: tab.sandboxType,
    providerId: tab.providerId,
    agent: tab.agent,
    status: tab.status,
    archiveReason: tab.archiveReason,
    pauseReason: tab.pauseReason,
    initialBranch: tab.initialBranch,
    envId: tab.envId,
    initialCommit: tab.initialCommit,
    lastActivityTs: tab.lastActivityTs,
    sandboxStartTs: tab.sandboxStartTs,
    sandboxEndTs: tab.sandboxEndTs,
    sandboxInfo: tab.sandboxInfo,
    lastFetchEventIndex: tab.lastFetchEventIndex,
    reloadRequestedTs: tab.reloadRequestedTs,
    codexAuthUpdateTs: tab.codexAuthUpdateTs,
    createdTs: tab.createdTs,
    serverTs: tab.serverTs,
    ...getEntProps({
      dataSt: sessionSt,
      dataLt: sessionLt,
      isMetadata: false,
      tabService: tabService,
      isEncryptDb: isEncryptDb,
      isEncryptMetadata: isEncryptMetadata
    })
  };

  return Result.succeed(sessionEnt);
}
