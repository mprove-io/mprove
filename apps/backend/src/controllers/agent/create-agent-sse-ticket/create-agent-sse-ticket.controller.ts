import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { SessionsService } from '#backend/services/db/sessions.service';
import { RedisService } from '#backend/services/redis.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import {
  ToBackendCreateAgentSseTicketRequest,
  ToBackendCreateAgentSseTicketResponsePayload
} from '#common/interfaces/to-backend/agent/to-backend-create-agent-sse-ticket';
import { ServerError } from '#common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateAgentSseTicketController {
  constructor(
    private sessionsService: SessionsService,
    private redisService: RedisService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCreateAgentSseTicket)
  async createSseTicket(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendCreateAgentSseTicketRequest = request.body;
    let { sessionId } = reqValid.payload;

    let session = await this.sessionsService.getSessionByIdCheckExists({
      sessionId
    });

    if (session.userId !== user.userId) {
      throw new ServerError({
        message: ErEnum.BACKEND_UNAUTHORIZED
      });
    }

    let sseTicket = makeId();

    await this.redisService.writeTicket({
      ticket: sseTicket,
      sessionId: sessionId
    });

    let payload: ToBackendCreateAgentSseTicketResponsePayload = {
      sseTicket: sseTicket
    };

    return payload;
  }
}
