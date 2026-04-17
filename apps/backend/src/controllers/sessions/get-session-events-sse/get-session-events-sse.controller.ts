import { Controller, MessageEvent, Query, Sse } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check.decorator';
import { SessionsService } from '#backend/services/db/sessions.service';
import { RedisService } from '#backend/services/redis.service';
import { SessionSseService } from '#backend/services/session/session-sse.service';
import { ErEnum } from '#common/enums/er.enum';
import { ServerError } from '#common/models/server-error';

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
  sessionEventsSse(
    @Query('sessionId') sessionId: string,
    @Query('ticket') ticket: string,
    @Query('lastEventIndex') lastEventIndexStr?: string
  ): Observable<MessageEvent> {
    return new Observable<MessageEvent>(observer => {
      this.redisService
        .consumeTicket({ ticket })
        .then(async consumedSessionId => {
          if (!consumedSessionId || consumedSessionId !== sessionId) {
            throw new ServerError({
              message: ErEnum.BACKEND_UNAUTHORIZED
            });
          }

          await this.sessionsService.getSessionByIdCheckExists({
            sessionId
          });

          let lastEventIndex =
            lastEventIndexStr != null ? parseInt(lastEventIndexStr, 10) : -1;

          let subscription = this.sessionSseService
            .subscribeWithBackfill({
              sessionId: sessionId,
              lastEventIndex: lastEventIndex
            })
            .pipe(
              map(
                event =>
                  ({
                    id: event.eventIndex.toString(),
                    type: 'session-event',
                    data: JSON.stringify(event)
                  }) as MessageEvent
              )
            )
            .subscribe(observer);

          return () => {
            subscription.unsubscribe();
          };
        })
        .catch(e => {
          observer.error(e);
        });
    });
  }
}
