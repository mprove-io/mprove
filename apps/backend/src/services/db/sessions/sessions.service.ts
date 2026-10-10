import { Inject, Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, desc, eq, inArray, notInArray } from 'drizzle-orm';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  OcSessionTab,
  SessionTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { ocSessionsTable } from '#backend/drizzle/postgres/schema/oc-sessions';
import {
  type SessionEnt,
  sessionsTable
} from '#backend/drizzle/postgres/schema/sessions';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { PROD_REPO_ID } from '#common/constants/top';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { CheckRepoIdResultError } from '#common/types/backend/function-errors/check-repo-id-result-error';
import type { GetSessionByIdCheckExistsResultError } from '#common/types/backend/function-errors/get-session-by-id-check-exists-result-error';
import type { OcSessionApi } from '#common/types/backend/parts/session/oc-session-api';
import type { SandboxType } from '#common/types/backend/parts/session/sandbox-type';
import type { SessionApi } from '#common/types/backend/parts/session/session-api';
import type { SessionStatus } from '#common/types/backend/parts/session/session-status';
import type { SessionType } from '#common/types/backend/parts/session/session-type';
import type { RepoType } from '#common/types/disk/parts/repo/repo-type';

@Injectable()
export class SessionsService {
  constructor(
    @Inject(DRIZZLE) private db: Db,
    private tabService: TabService
  ) {}

  makeSession(item: {
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

  makeOcSession(item: { sessionId: string }): OcSessionTab {
    let ocSession: OcSessionTab = {
      sessionId: item.sessionId,
      serverTs: undefined,
      keyTag: undefined
    };

    return ocSession;
  }

  async getSessionByIdCheckExists(item: {
    sessionId: string;
  }): Promise<SessionTab> {
    let result: Result.Result<
      SessionTab,
      GetSessionByIdCheckExistsResultError
    > = await this.getSessionByIdCheckExistsResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let session: SessionTab = result.value;

    return session;
  }

  async getSessionByIdCheckExistsResult(item: {
    sessionId: string;
  }): Result.ResultAsync<SessionTab, GetSessionByIdCheckExistsResultError> {
    let { sessionId } = item;

    return this.db.drizzle.query.sessionsTable
      .findFirst({
        where: eq(sessionsTable.sessionId, sessionId)
      })
      .then((sessionEnt: SessionEnt) =>
        isUndefined(sessionEnt)
          ? Result.fail({ code: 'BACKEND_SESSION_NOT_FOUND' })
          : this.tabService.sessionEntToTabResult({ sessionEnt: sessionEnt })
      );
  }

  async getOcSessionBySessionId(item: {
    sessionId: string;
  }): Promise<OcSessionTab> {
    let ocSessionEnt = await this.db.drizzle.query.ocSessionsTable.findFirst({
      where: eq(ocSessionsTable.sessionId, item.sessionId)
    });

    return this.tabService.ocSessionEntToTab(ocSessionEnt);
  }

  tabToSessionApi(item: {
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

  async checkRepoId(item: {
    repoId: string;
    userId: string;
    projectId: string;
    allowProdRepo: boolean;
  }): Promise<RepoType> {
    let result: Result.Result<RepoType, CheckRepoIdResultError> =
      await this.checkRepoIdResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let repoType: RepoType = result.value;

    return repoType;
  }

  async checkRepoIdResult(item: {
    repoId: string;
    userId: string;
    projectId: string;
    allowProdRepo: boolean;
  }): Result.ResultAsync<RepoType, CheckRepoIdResultError> {
    let { repoId, userId, projectId, allowProdRepo } = item;

    if (repoId === PROD_REPO_ID) {
      if (allowProdRepo === false) {
        return Result.fail({ code: 'BACKEND_PRODUCTION_REPO_NOT_ALLOWED' });
      }

      return Result.succeed('production');
    }

    if (repoId === userId) {
      return Result.succeed('dev');
    }

    let sessionEnt: SessionEnt =
      await this.db.drizzle.query.sessionsTable.findFirst({
        where: and(
          eq(sessionsTable.sessionId, repoId),
          eq(sessionsTable.repoId, repoId),
          eq(sessionsTable.userId, userId),
          eq(sessionsTable.projectId, projectId)
        )
      });

    if (sessionEnt) {
      return Result.succeed('session');
    }

    return Result.fail({ code: 'BACKEND_FORBIDDEN_REPO_ID' });
  }

  tabToOcSessionApi(item: { ocSession: OcSessionTab }): OcSessionApi {
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

  async getBasicSessionsList(item: {
    projectId: string;
    userId: string;
    currentSessionId?: string;
  }): Promise<{ sessions: SessionApi[]; hasMoreArchived: boolean }> {
    let { projectId, userId, currentSessionId } = item;

    let sessionEnts = await this.db.drizzle.query.sessionsTable.findMany({
      where: and(
        eq(sessionsTable.projectId, projectId),
        eq(sessionsTable.userId, userId),
        notInArray(sessionsTable.status, ['Deleted', 'Archived'])
      ),
      orderBy: [desc(sessionsTable.createdTs)]
    });

    let allEnts: SessionEnt[] = [...sessionEnts];

    if (currentSessionId) {
      let alreadyIncluded = allEnts.some(e => e.sessionId === currentSessionId);
      if (!alreadyIncluded) {
        let currentSessionEnt =
          await this.db.drizzle.query.sessionsTable.findFirst({
            where: and(
              eq(sessionsTable.sessionId, currentSessionId),
              eq(sessionsTable.projectId, projectId),
              eq(sessionsTable.userId, userId)
            )
          });
        if (currentSessionEnt) {
          allEnts = [...allEnts, currentSessionEnt];
        }
      }
    }

    let archivedExists = await this.db.drizzle.query.sessionsTable.findFirst({
      where: and(
        eq(sessionsTable.projectId, projectId),
        eq(sessionsTable.userId, userId),
        eq(sessionsTable.status, 'Archived')
      ),
      columns: { sessionId: true }
    });

    let sessions = await this.entsToSessionApis({ allEnts });

    return {
      sessions,
      hasMoreArchived: archivedExists !== undefined
    };
  }

  async entsToSessionApis(item: {
    allEnts: SessionEnt[];
  }): Promise<SessionApi[]> {
    let { allEnts } = item;

    let statusOrder: Partial<Record<SessionStatus, number>> = {
      ['New']: 0,
      ['Active']: 1,
      ['Error']: 2,
      ['Paused']: 3,
      ['Archived']: 4
    };

    allEnts.sort((a, b) => {
      let statusDiff =
        (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
      if (statusDiff !== 0) return statusDiff;
      return b.createdTs - a.createdTs;
    });

    let sessionIds = allEnts.map(e => e.sessionId);

    let ocSessionEnts =
      sessionIds.length > 0
        ? await this.db.drizzle.query.ocSessionsTable.findMany({
            where: inArray(ocSessionsTable.sessionId, sessionIds)
          })
        : [];

    let ocSessionTabs = ocSessionEnts.map(e =>
      this.tabService.ocSessionEntToTab(e)
    );

    return allEnts.map(ent => {
      let session = this.tabService.sessionEntToTab(ent);
      let ocSession = ocSessionTabs.find(
        o => o.sessionId === session.sessionId
      );
      return this.tabToSessionApi({ session, ocSession });
    });
  }
}
