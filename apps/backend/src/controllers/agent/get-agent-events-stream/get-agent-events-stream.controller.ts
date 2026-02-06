import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { EventsService } from '#backend/services/db/events.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToBackendGetAgentEventsStreamRequest } from '#common/interfaces/to-backend/agent/to-backend-get-agent-events-stream';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetAgentEventsStreamController {
  constructor(
    private sessionsService: SessionsService,
    private eventsService: EventsService,
    private tabService: TabService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetAgentEventsStream)
  async getEventsStream(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetAgentEventsStreamRequest = request.body;
    let { sessionId, lastSequence } = reqValid.payload;

    await this.sessionsService.getSessionByIdCheckExists({ sessionId });

    let events = await this.eventsService.getBySessionId({
      sessionId: sessionId,
      afterSequence: lastSequence
    });

    let payload = {
      events: events.map(e => {
        let tab = this.tabService.eventEntToTab(e);
        return {
          eventId: tab.eventId,
          sequence: tab.sequence,
          type: tab.type,
          eventData: tab.universalEvent?.data
        };
      })
    };

    return payload;
  }
}
