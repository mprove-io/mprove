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
import { ServerError } from '#common/classes/server-error/server-error';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { makeId } from '#common/functions/make-id/make-id';
import type { ToBackendRoute } from '#common/types/to-backend-route';
import type { ToBackendCreateSessionSseTicketOutput } from '#common/zod/backend/routes/sessions/create-session-sse-ticket/create-session-sse-ticket-response';

@ApiTags('Sessions')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateSessionSseTicketController {
  constructor(
    private sessionsService: SessionsService,
    private redisService: RedisService
  ) {}

  @Post('api/ToBackendCreateSessionSseTicket' satisfies ToBackendRoute)
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
    let { sessionId } = body.input;

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

    let payload: ToBackendCreateSessionSseTicketOutput = {
      sseTicket: sseTicket
    };

    return payload;
  }
}
