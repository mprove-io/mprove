import {
  Controller,
  type MessageEvent,
  NotFoundException,
  Query,
  Sse,
  UnauthorizedException
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check/skip-jwt-check.decorator';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { RedisService } from '#backend/services/redis/redis.service';
import { SessionSseService } from '#backend/services/session/session-sse/session-sse.service';
import { ServerError } from '#common/classes/server-error/server-error';

export const SSE_SESSION_EVENTS_PATH = 'api/sse/session-events';

@ApiTags('Sessions')
@SkipJwtCheck()
@SkipThrottle()
@Controller()
export class GetSessionEventsSseController {
  constructor(
    private redisService: RedisService,
    private sessionSseService: SessionSseService,
    private sessionsService: SessionsService
  ) {}

  @Sse(SSE_SESSION_EVENTS_PATH)
  @ApiOperation({
    summary: 'GetSessionEventsSse',
    description: 'Stream session events over Server-Sent Events'
  })
  @ApiOkResponse()
  async sessionEventsSse(
    @Query('sessionId') sessionId: string,
    @Query('ticket') ticket: string,
    @Query('lastEventIndex') lastEventIndexStr?: string
  ): Promise<Observable<MessageEvent>> {
    // Validate before returning the Observable so HTTP errors precede SSE headers.
    let consumedSessionId: string = await this.redisService.consumeTicket({
      ticket: ticket
    });

    if (!consumedSessionId || consumedSessionId !== sessionId) {
      throw new UnauthorizedException();
    }

    try {
      await this.sessionsService.getSessionByIdCheckExists({
        sessionId: sessionId
      });
    } catch (error) {
      if (
        error instanceof ServerError &&
        error.message === 'BACKEND_SESSION_NOT_FOUND'
      ) {
        throw new NotFoundException();
      }

      // Preserve internal diagnostics; the SSE filter logs and sanitizes them.
      throw error;
    }

    let lastEventIndex: number =
      lastEventIndexStr != null ? parseInt(lastEventIndexStr, 10) : -1;

    // Return the producer directly; RxJS propagates disconnect teardown to it.
    let stream: Observable<MessageEvent> = this.sessionSseService
      .subscribeWithBackfill({
        sessionId: sessionId,
        lastEventIndex: lastEventIndex
      })
      .pipe(
        map(
          (event): MessageEvent => ({
            id: event.eventIndex.toString(),
            type: 'session-event',
            data: JSON.stringify(event)
          })
        )
      );

    return stream;
  }
}
