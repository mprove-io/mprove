import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { asc, eq } from 'drizzle-orm';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ocEventsTable } from '#backend/drizzle/postgres/schema/oc-events';
import { ocMessagesTable } from '#backend/drizzle/postgres/schema/oc-messages';
import { ocPartsTable } from '#backend/drizzle/postgres/schema/oc-parts';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { AgentSandboxService } from '#backend/services/agent-sandbox.service';
import { AgentStreamService } from '#backend/services/agent-stream.service';
import { ProjectsService } from '#backend/services/db/projects.service.js';
import { SessionsService } from '#backend/services/db/sessions.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ArchivedReasonEnum } from '#common/enums/archived-reason.enum';
import { ErEnum } from '#common/enums/er.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { AgentEventApi } from '#common/interfaces/backend/agent-event-api';
import { AgentMessageApi } from '#common/interfaces/backend/agent-message-api';
import { AgentPartApi } from '#common/interfaces/backend/agent-part-api';
import {
  ToBackendGetAgentSessionRequest,
  ToBackendGetAgentSessionResponsePayload
} from '#common/interfaces/to-backend/agent/to-backend-get-agent-session';
import { ServerError } from '#common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetAgentSessionController {
  constructor(
    private sessionsService: SessionsService,
    private projectsService: ProjectsService,
    private tabService: TabService,
    private agentSandboxService: AgentSandboxService,
    private agentStreamService: AgentStreamService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetAgentSession)
  async getAgentSession(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetAgentSessionRequest = request.body;
    let { sessionId, includeMessagesAndParts } = reqValid.payload;

    let session = await this.sessionsService.getSessionByIdCheckExists({
      sessionId
    });

    let project = await this.projectsService.getProjectCheckExists({
      projectId: session.projectId
    });

    if (session.userId !== user.userId) {
      throw new ServerError({
        message: ErEnum.BACKEND_UNAUTHORIZED
      });
    }

    if (session.status === SessionStatusEnum.Deleted) {
      throw new ServerError({
        message: ErEnum.BACKEND_AGENT_SESSION_NOT_FOUND
      });
    }

    let sandboxInfo = await this.agentSandboxService.getSandboxInfo({
      sandboxId: session.sandboxId,
      e2bApiKey: project.e2bApiKey
    });

    if (!sandboxInfo || sandboxInfo.state === 'paused') {
      if (!sandboxInfo) {
        session.status = SessionStatusEnum.Archived;
        session.archivedReason = ArchivedReasonEnum.Expire;
      } else if (sandboxInfo.state === 'paused') {
        session.status = SessionStatusEnum.Paused;
      }

      await this.db.drizzle.transaction(async tx => {
        await this.db.packer.write({
          tx: tx,
          insertOrUpdate: {
            sessions: [session]
          }
        });
      });
    }

    if (
      session.status === SessionStatusEnum.Active &&
      session.opencodeSessionId
    ) {
      await this.agentStreamService.startEventStream({
        sessionId,
        opencodeSessionId: session.opencodeSessionId
      });
    }

    let ocSession = await this.sessionsService.getOcSessionBySessionId({
      sessionId
    });

    let events: AgentEventApi[] = [];

    if (session.status !== SessionStatusEnum.Archived) {
      let eventEnts = await this.db.drizzle.query.ocEventsTable.findMany({
        where: eq(ocEventsTable.sessionId, sessionId),
        orderBy: [asc(ocEventsTable.eventIndex)]
      });

      events = eventEnts.map(ent => {
        let tab = this.tabService.ocEventEntToTab(ent);
        return {
          eventId: tab.eventId,
          eventIndex: tab.eventIndex,
          eventType: tab.type,
          ocEvent: tab.ocEvent
        };
      });
    }

    let sessionApi = this.sessionsService.tabToSessionApi({
      session,
      ocSession
    });

    let ocSessionApi = ocSession
      ? this.sessionsService.tabToOcSessionApi({ ocSession })
      : undefined;

    let messages: AgentMessageApi[] = [];
    let parts: AgentPartApi[] = [];

    if (includeMessagesAndParts === true) {
      let messageEnts = await this.db.drizzle.query.ocMessagesTable.findMany({
        where: eq(ocMessagesTable.sessionId, sessionId),
        orderBy: [asc(ocMessagesTable.messageId)]
      });

      messages = messageEnts.map(ent => {
        let tab = this.tabService.ocMessageEntToTab(ent);
        return {
          messageId: tab.messageId,
          sessionId: tab.sessionId,
          role: tab.role,
          ocMessage: tab.ocMessage
        };
      });

      let partEnts = await this.db.drizzle.query.ocPartsTable.findMany({
        where: eq(ocPartsTable.sessionId, sessionId),
        orderBy: [asc(ocPartsTable.partId)]
      });

      parts = partEnts.map(ent => {
        let tab = this.tabService.ocPartEntToTab(ent);
        return {
          partId: tab.partId,
          messageId: tab.messageId,
          sessionId: tab.sessionId,
          ocPart: tab.ocPart
        };
      });
    }

    let result = await this.sessionsService.getBasicSessionsList({
      projectId: session.projectId,
      userId: user.userId,
      currentSessionId: sessionId
    });

    let payload: ToBackendGetAgentSessionResponsePayload = {
      session: sessionApi,
      ocSession: ocSessionApi,
      events: events,
      messages: messages,
      parts: parts,
      sessions: result.sessions,
      hasMoreArchived: result.hasMoreArchived
    };

    return payload;
  }
}
