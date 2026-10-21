import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  ToBackendCreateSessionSseTicketRequestDto,
  ToBackendCreateSessionSseTicketResponseDto
} from '#backend/controllers/sessions/create-session-sse-ticket/create-session-sse-ticket.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { RedisService } from '#backend/services/redis/redis.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { makeId } from '#common/functions/make-id/make-id';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateSessionSseTicketOutput } from '#common/types/backend/routes/sessions/create-session-sse-ticket/create-session-sse-ticket-output';

@ApiTags('Sessions')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateSessionSseTicketController {
  constructor(
    private redisService: RedisService,
    private db: DbService
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
  ): Promise<BackendResultForOperation<'createSessionSseTicket'>> {
    return Result.pipe(
      Result.succeed({ sessionId: body.input.sessionId, userId: user.userId }),
      Result.bind('session', v =>
        this.db.sessions.findFirstCheckExists({
          where: eq(sessionsTable.sessionId, v.sessionId)
        })
      ),
      Result.andThrough(v =>
        v.session.userId !== v.userId
          ? Result.fail({ code: 'BACKEND_UNAUTHORIZED' })
          : Result.succeed()
      ),
      Result.bind('sseTicket', v => Result.succeed(makeId())),
      Result.andThrough(async v => {
        await this.redisService.writeTicket({
          ticket: v.sseTicket,
          sessionId: v.sessionId
        });
        return Result.succeed();
      }),
      Result.map(
        (v): ToBackendCreateSessionSseTicketOutput => ({
          sseTicket: v.sseTicket
        })
      )
    );
  }
}
