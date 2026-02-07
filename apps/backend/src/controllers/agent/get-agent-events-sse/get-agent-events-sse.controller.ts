import { Controller, MessageEvent, Query, Sse } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check.decorator';
import { AgentEventsService } from '#backend/services/agent-events.service';
import { RedisService } from '#backend/services/redis.service';
import { ErEnum } from '#common/enums/er.enum';
import { ServerError } from '#common/models/server-error';

export const SSE_AGENT_EVENTS_PATH = 'api/sse/agent-events';

@SkipJwtCheck()
@SkipThrottle()
@Controller()
export class GetAgentEventsSseController {
  constructor(
    private redisService: RedisService,
    private agentEventsService: AgentEventsService
  ) {}

  @Sse(SSE_AGENT_EVENTS_PATH)
  agentEventsSse(
    @Query('sessionId') sessionId: string,
    @Query('ticket') ticket: string
  ): Observable<MessageEvent> {
    return new Observable<MessageEvent>(observer => {
      this.redisService
        .consumeTicket({ ticket })
        .then(consumedSessionId => {
          if (!consumedSessionId || consumedSessionId !== sessionId) {
            throw new ServerError({
              message: ErEnum.BACKEND_UNAUTHORIZED
            });
          }

          let subscription = this.agentEventsService
            .subscribe(sessionId)
            .pipe(
              map(
                event =>
                  ({
                    id: String(event.sequence),
                    type: 'agent-event',
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
