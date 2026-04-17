import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendCreateSessionSseTicketRequestDto,
  ToBackendCreateSessionSseTicketResponseDto
} from '#backend/controllers/sessions/create-session-sse-ticket/create-session-sse-ticket.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { SessionsService } from '#backend/services/db/sessions.service';
import { RedisService } from '#backend/services/redis.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import { ServerError } from '#common/models/server-error';
import type { ToBackendCreateSessionSseTicketResponsePayload } from '#common/zod/to-backend/sessions/to-backend-create-session-sse-ticket';

@ApiTags('Sessions')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateSessionSseTicketController {
  constructor(
    private sessionsService: SessionsService,
    private redisService: RedisService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCreateSessionSseTicket)
  @ApiOperation({
    summary: 'CreateSessionSseTicket',
    description: 'Issue a short-lived ticket for authorizing the SSE stream'
  })
  @ApiOkResponse({
    type: ToBackendCreateSessionSseTicketResponseDto
  })
  async createSseTicket(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCreateSessionSseTicketRequestDto
  ) {
    let { sessionId } = body.payload;

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

    let payload: ToBackendCreateSessionSseTicketResponsePayload = {
      sseTicket: sseTicket
    };

    return payload;
  }
}
