import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { asc, eq } from 'drizzle-orm';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { eventsTable } from '#backend/drizzle/postgres/schema/events';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { SessionsService } from '#backend/services/db/sessions.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { AgentEventApi } from '#common/interfaces/backend/agent-event-api';
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
    let { sessionId } = reqValid.payload;

    let session = await this.sessionsService.getSessionByIdCheckExists({
      sessionId
    });

    if (session.userId !== user.userId) {
      throw new ServerError({
        message: ErEnum.BACKEND_UNAUTHORIZED
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
        eventType: tab.sender,
        ocEvent: tab.ocEvent
      };
    });

    let sessionApi: AgentSessionApi = {
      sessionId: session.sessionId,
      provider: session.provider,
      agentMode: session.agentMode,
      model: session.model,
      lastMessageProviderModel: session.lastMessageProviderModel,
      status: session.status,
      createdTs: session.createdTs,
      lastActivityTs: session.lastActivityTs,
      firstMessage: session.firstMessage
    };

    let payload: ToBackendGetAgentSessionResponsePayload = {
      session: sessionApi,
      events: events
    };

    return payload;
  }
}
