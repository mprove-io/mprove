import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { asc, eq } from 'drizzle-orm';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { eventsTable } from '#backend/drizzle/postgres/schema/events';
import { messagesTable } from '#backend/drizzle/postgres/schema/messages';
import { partsTable } from '#backend/drizzle/postgres/schema/parts';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { SessionsService } from '#backend/services/db/sessions.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { AgentEventApi } from '#common/interfaces/backend/agent-event-api';
import { AgentMessageApi } from '#common/interfaces/backend/agent-message-api';
import { AgentPartApi } from '#common/interfaces/backend/agent-part-api';
import { AgentSessionApi } from '#common/interfaces/backend/agent-session-api';
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
    private tabService: TabService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetAgentSession)
  async getAgentSession(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetAgentSessionRequest = request.body;
    let { sessionId, includeMessagesAndParts } = reqValid.payload;

    let session = await this.sessionsService.getSessionByIdCheckExists({
      sessionId
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

    let eventEnts = await this.db.drizzle.query.eventsTable.findMany({
      where: eq(eventsTable.sessionId, sessionId),
      orderBy: [asc(eventsTable.eventIndex)]
    });

    let events: AgentEventApi[] = eventEnts.map(ent => {
      let tab = this.tabService.eventEntToTab(ent);
      return {
        eventId: tab.eventId,
        eventIndex: tab.eventIndex,
        eventType: tab.type,
        ocEvent: tab.ocEvent
      };
    });

    let sessionApi: AgentSessionApi = {
      sessionId: session.sessionId,
      provider: session.provider,
      agent: session.agent,
      model: session.model,
      lastMessageProviderModel: session.lastMessageProviderModel,
      lastMessageVariant: session.lastMessageVariant,
      status: session.status,
      createdTs: session.createdTs,
      lastActivityTs: session.lastActivityTs,
      firstMessage: session.firstMessage,
      title: session.ocSession?.title,
      todos: session.todos ?? [],
      questions: session.questions ?? [],
      permissions: session.permissions ?? []
    };

    let payload: ToBackendGetAgentSessionResponsePayload = {
      session: sessionApi,
      events: events
    };

    if (includeMessagesAndParts === true) {
      let messageEnts = await this.db.drizzle.query.messagesTable.findMany({
        where: eq(messagesTable.sessionId, sessionId),
        orderBy: [asc(messagesTable.messageId)]
      });

      let messages: AgentMessageApi[] = messageEnts.map(ent => {
        let tab = this.tabService.messageEntToTab(ent);
        return {
          messageId: tab.messageId,
          sessionId: tab.sessionId,
          role: tab.role,
          ocMessage: tab.ocMessage
        };
      });

      let partEnts = await this.db.drizzle.query.partsTable.findMany({
        where: eq(partsTable.sessionId, sessionId),
        orderBy: [asc(partsTable.partId)]
      });

      let parts: AgentPartApi[] = partEnts.map(ent => {
        let tab = this.tabService.partEntToTab(ent);
        return {
          partId: tab.partId,
          messageId: tab.messageId,
          sessionId: tab.sessionId,
          ocPart: tab.ocPart
        };
      });

      payload.messages = messages;
      payload.parts = parts;
    }

    return payload;
  }
}
