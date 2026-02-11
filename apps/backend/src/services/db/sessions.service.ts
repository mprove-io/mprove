import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { CreateSessionResponse } from 'sandbox-agent';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { SessionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions';
import { ErEnum } from '#common/enums/er.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
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
    userId: string;
    projectId: string;
    sandboxType: string;
    agent: string;
    model: string;
    agentMode: string;
    permissionMode: string;
    sandboxId: string;
    sandboxBaseUrl: string;
    sandboxAgentToken: string;
    sdkCreateSessionResponse: CreateSessionResponse;
    status: SessionStatusEnum;
    lastActivityTs: number;
    runningStartTs: number;
    expiresAt: number;
    createdTs: number;
  }): SessionTab {
    let session: SessionTab = {
      sessionId: item.sessionId,
      userId: item.userId,
      projectId: item.projectId,
      sandboxType: item.sandboxType,
      agent: item.agent,
      model: item.model,
      agentMode: item.agentMode,
      permissionMode: item.permissionMode,
      sandboxId: item.sandboxId,
      sandboxBaseUrl: item.sandboxBaseUrl,
      sandboxAgentToken: item.sandboxAgentToken,
      sdkCreateSessionResponse: item.sdkCreateSessionResponse,
      status: item.status,
      lastActivityTs: item.lastActivityTs,
      runningStartTs: item.runningStartTs,
      expiresAt: item.expiresAt,
      createdTs: item.createdTs,
      serverTs: undefined,
      keyTag: undefined
    };

    return session;
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
}
