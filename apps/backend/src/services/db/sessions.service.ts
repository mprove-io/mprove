import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  OcSessionTab,
  SessionTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { ocSessionsTable } from '#backend/drizzle/postgres/schema/oc-sessions';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions';
import { ErEnum } from '#common/enums/er.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
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
    permissionMode: string;
    sandboxId?: string;
    sandboxBaseUrl?: string;
    opencodeSessionId?: string;
    opencodePassword?: string;
    firstMessage?: string;
    initialBranch: string;
    initialCommit?: string;
    status: SessionStatusEnum;
    lastActivityTs: number;
    runningStartTs?: number;
    expiresAt?: number;
    createdTs: number;
  }): SessionTab {
    let session: SessionTab = {
      sessionId: item.sessionId,
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
      permissionMode: item.permissionMode,
      sandboxId: item.sandboxId,
      sandboxBaseUrl: item.sandboxBaseUrl,
      opencodeSessionId: item.opencodeSessionId,
      opencodePassword: item.opencodePassword,
      firstMessage: item.firstMessage,
      initialBranch: item.initialBranch,
      initialCommit: item.initialCommit,
      status: item.status,
      archivedReason: undefined,
      lastActivityTs: item.lastActivityTs,
      runningStartTs: item.runningStartTs,
      expiresAt: item.expiresAt,
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
      repoId: session.repoId,
      branchId: session.branchId,
      provider: session.provider,
      agent: session.agent,
      model: session.model,
      lastMessageProviderModel: session.lastMessageProviderModel,
      lastMessageVariant: session.lastMessageVariant,
      status: session.status,
      archivedReason: session.archivedReason,
      initialBranch: session.initialBranch,
      initialCommit: session.initialCommit,
      createdTs: session.createdTs,
      lastActivityTs: session.lastActivityTs,
      firstMessage: session.firstMessage,
      title: ocSession?.openSession?.title
    };
  }

  tabToOcSessionApi(item: { ocSession: OcSessionTab }): OcSessionApi {
    let { ocSession } = item;

    return {
      sessionId: ocSession.sessionId,
      todos: ocSession.todos,
      questions: ocSession.questions,
      permissions: ocSession.permissions
    };
  }
}
