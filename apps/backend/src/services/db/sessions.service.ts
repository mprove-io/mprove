import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, inArray, notInArray } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  OcSessionTab,
  SessionTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { ocSessionsTable } from '#backend/drizzle/postgres/schema/oc-sessions';
import {
  SessionEnt,
  sessionsTable
} from '#backend/drizzle/postgres/schema/sessions';
import { PROD_REPO_ID } from '#common/constants/top';
import { ErEnum } from '#common/enums/er.enum';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { OcSessionApi } from '#common/interfaces/backend/oc-session-api';
import { SessionApi } from '#common/interfaces/backend/session-api';
import { ServerError } from '#common/models/server-error';
import { TabService } from '../tab.service';

@Injectable()
export class SessionsService {
  constructor(
    @Inject(DRIZZLE) private db: Db,
    private tabService: TabService
  ) {}

  makeSession(item: {
    sessionId: string;
    type: SessionTypeEnum;
    repoId: string;
    branchId: string;
    userId: string;
    projectId: string;
    sandboxType: string;
    provider: string;
    model?: string;
    lastMessageProviderModel?: string;
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
    initialBranch: string;
    initialCommit?: string;
    status: SessionStatusEnum;
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
      provider: item.provider,
      model: item.model,
      lastMessageProviderModel: item.lastMessageProviderModel,
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
      initialBranch: item.initialBranch,
      initialCommit: item.initialCommit,
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
    let session = await this.db.drizzle.query.sessionsTable.findFirst({
      where: eq(sessionsTable.sessionId, item.sessionId)
    });

    if (!session) {
      throw new ServerError({
        message: ErEnum.BACKEND_AGENT_SESSION_NOT_FOUND
      });
    }

    return this.tabService.sessionEntToTab(session);
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
      provider: session.provider,
      agent: session.agent,
      model: session.model,
      lastMessageProviderModel: session.lastMessageProviderModel,
      lastMessageVariant: session.lastMessageVariant,
      status: session.status,
      archiveReason: session.archiveReason,
      pauseReason: session.pauseReason,
      initialBranch: session.initialBranch,
      initialCommit: session.initialCommit,
      createdTs: session.createdTs,
      lastActivityTs: session.lastActivityTs,
      firstMessage: session.firstMessage,
      title: ocSession?.openSession?.title,
      opencodeSessionId: session.opencodeSessionId
    };
  }

  async checkRepoId(item: {
    repoId: string;
    userId: string;
    projectId: string;
  }): Promise<RepoTypeEnum> {
    let { repoId, userId, projectId } = item;

    if (repoId === PROD_REPO_ID) {
      return RepoTypeEnum.Production;
    }

    if (repoId === userId) {
      return RepoTypeEnum.Dev;
    }

    let session = await this.db.drizzle.query.sessionsTable.findFirst({
      where: and(
        eq(sessionsTable.sessionId, repoId),
        eq(sessionsTable.repoId, repoId),
        eq(sessionsTable.userId, userId),
        eq(sessionsTable.projectId, projectId)
      )
    });

    if (session) {
      return RepoTypeEnum.Session;
    }

    throw new ServerError({
      message: ErEnum.BACKEND_FORBIDDEN_REPO_ID
    });
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
        notInArray(sessionsTable.status, [
          SessionStatusEnum.Deleted,
          SessionStatusEnum.Archived
        ])
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
        eq(sessionsTable.status, SessionStatusEnum.Archived)
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

    let statusOrder: Record<string, number> = {
      [SessionStatusEnum.New]: 0,
      [SessionStatusEnum.Active]: 1,
      [SessionStatusEnum.Error]: 2,
      [SessionStatusEnum.Paused]: 3,
      [SessionStatusEnum.Archived]: 4
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
