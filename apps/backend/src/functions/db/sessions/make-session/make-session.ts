import type { SessionTab } from '#backend/drizzle/postgres/tables/sessions';
import type { SandboxType } from '#common/types/backend/parts/session/sandbox-type';
import type { SessionStatus } from '#common/types/backend/parts/session/session-status';
import type { SessionType } from '#common/types/backend/parts/session/session-type';

export function makeSession(item: {
  sessionId: string;
  type: SessionType;
  repoId: string;
  branchId: string;
  userId: string;
  projectId: string;
  sandboxType: SandboxType;
  providerId: string;
  modelId: string;
  lastMessageVariant?: string;
  agent: string;
  sandboxId?: string;
  sandboxBaseUrl?: string;
  opencodeSessionId?: string;
  opencodePassword?: string;
  firstMessage?: string;
  apiKeyPrefix?: string;
  apiKeySecretHash?: string;
  apiKeySalt?: string;
  providerConfigHash?: string;
  initialBranch?: string;
  envId?: string;
  initialCommit?: string;
  codexAuthUpdateTs: number;
  status: SessionStatus;
  lastActivityTs: number;
  sandboxStartTs?: number;
  sandboxEndTs?: number;
  sandboxInfo?: any;
  createdTs: number;
}): SessionTab {
  let session: SessionTab = {
    sessionId: item.sessionId,
    type: item.type,
    repoId: item.repoId,
    branchId: item.branchId,
    userId: item.userId,
    projectId: item.projectId,
    sandboxType: item.sandboxType,
    providerId: item.providerId,
    modelId: item.modelId,
    lastMessageVariant: item.lastMessageVariant,
    agent: item.agent,
    sandboxId: item.sandboxId,
    sandboxBaseUrl: item.sandboxBaseUrl,
    opencodeSessionId: item.opencodeSessionId,
    opencodePassword: item.opencodePassword,
    firstMessage: item.firstMessage,
    apiKeyPrefix: item.apiKeyPrefix,
    apiKeySecretHash: item.apiKeySecretHash,
    apiKeySalt: item.apiKeySalt,
    providerConfigHash: item.providerConfigHash,
    closedExplorerTabIds: [],
    initialBranch: item.initialBranch,
    envId: item.envId,
    initialCommit: item.initialCommit,
    codexAuthUpdateTs: item.codexAuthUpdateTs,
    status: item.status,
    archiveReason: undefined,
    pauseReason: undefined,
    lastActivityTs: item.lastActivityTs,
    sandboxStartTs: item.sandboxStartTs,
    sandboxEndTs: item.sandboxEndTs,
    sandboxInfo: item.sandboxInfo,
    lastFetchEventIndex: undefined,
    reloadRequestedTs: undefined,
    createdTs: item.createdTs,
    serverTs: undefined,
    keyTag: undefined
  };

  return session;
}
