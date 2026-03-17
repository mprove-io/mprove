import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Event } from '@opencode-ai/sdk/v2';
import { and, asc, eq, gt } from 'drizzle-orm';
import { Redis } from 'ioredis';
import { Observable, Subject } from 'rxjs';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import { ocEventsTable } from '#backend/drizzle/postgres/schema/oc-events.js';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { CHANNEL_AGENT_SSE } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ServerError } from '#common/models/server-error';
import { TabService } from '../tab.service';

export interface AgentEvent {
  eventId: string;
  eventIndex: number;
  eventType: string;
  ocEvent: Event;
}

@Injectable()
export class AgentSseService implements OnModuleDestroy {
  private redisPubClient: Redis;
  private redisSubClient: Redis;

  private channelListeners = new Map<string, Set<Subject<AgentEvent>>>();

  constructor(
    private cs: ConfigService<BackendConfig>,
    private tabService: TabService,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {
    let valkeyHost =
      this.cs.get<BackendConfig['backendValkeyHost']>('backendValkeyHost');

    let valkeyPassword = this.cs.get<BackendConfig['backendValkeyPassword']>(
      'backendValkeyPassword'
    );

    let redisOptions = {
      host: valkeyHost,
      port: 6379,
      password: valkeyPassword
    };

    this.redisPubClient = new Redis(redisOptions);
    this.redisSubClient = new Redis(redisOptions);

    this.redisSubClient.on('error', (err: Error) => {
      logToConsoleBackend({
        log: new ServerError({
          message: ErEnum.BACKEND_AGENT_REDIS_SUB_CLIENT_ERROR,
          originalError: err
        }),
        logLevel: LogLevelEnum.Error,
        logger: this.logger,
        cs: this.cs
      });
    });

    this.redisSubClient.on('message', (channel: string, message: string) => {
      let listeners = this.channelListeners.get(channel);
      if (listeners) {
        let event = JSON.parse(message) as AgentEvent;
        for (let subject of listeners) {
          subject.next(event);
        }
      }
    });
  }

  onModuleDestroy() {
    this.redisPubClient.disconnect();
    this.redisSubClient.disconnect();
  }

  async publish(item: { sessionId: string; event: AgentEvent }): Promise<void> {
    let { sessionId, event } = item;
    await this.redisPubClient.publish(
      `${CHANNEL_AGENT_SSE}:${sessionId}`,
      JSON.stringify(event)
    );
  }

  subscribeWithBackfill(item: {
    sessionId: string;
    lastEventIndex: number;
  }): Observable<AgentEvent> {
    let { sessionId, lastEventIndex } = item;
    let channel = `${CHANNEL_AGENT_SSE}:${sessionId}`;

    return new Observable<AgentEvent>(observer => {
      let buffer: AgentEvent[] = [];
      let isBackfilling = true;

      // 1. Subscribe to live events immediately (buffer during backfill)
      let subject = new Subject<AgentEvent>();
      let liveSub = subject.subscribe(event => {
        if (isBackfilling) {
          buffer.push(event);
        } else {
          observer.next(event);
        }
      });

      let listeners = this.channelListeners.get(channel);

      if (listeners) {
        listeners.add(subject);
      } else {
        listeners = new Set([subject]);
        this.channelListeners.set(channel, listeners);
        this.redisSubClient.subscribe(channel).catch((err: Error) => {
          logToConsoleBackend({
            log: new ServerError({
              message: ErEnum.BACKEND_AGENT_REDIS_SUBSCRIBE_FAILED,
              originalError: err
            }),
            logLevel: LogLevelEnum.Error,
            logger: this.logger,
            cs: this.cs
          });
        });
      }

      // 2. Backfill from DB, then flush buffer and go live
      (async () => {
        try {
          let eventEnts = await this.db.drizzle.query.ocEventsTable.findMany({
            where: and(
              eq(ocEventsTable.sessionId, sessionId),
              gt(ocEventsTable.eventIndex, lastEventIndex)
            ),
            orderBy: [asc(ocEventsTable.eventIndex)]
          });

          let dbEvents = eventEnts.map(ent => {
            let tab = this.tabService.ocEventEntToTab(ent);
            return {
              eventId: tab.eventId,
              eventIndex: tab.eventIndex,
              eventType: tab.type,
              ocEvent: tab.ocEvent
            };
          });

          for (let event of dbEvents) {
            observer.next(event);
          }

          let maxDbIndex =
            dbEvents.length > 0
              ? dbEvents[dbEvents.length - 1].eventIndex
              : lastEventIndex;

          // Flush buffered live events that aren't covered by DB
          isBackfilling = false;
          for (let event of buffer) {
            if (event.eventIndex > maxDbIndex) {
              observer.next(event);
            }
          }
          buffer = [];
        } catch (err) {
          observer.error(err);
        }
      })();

      return () => {
        liveSub.unsubscribe();
        subject.complete();

        let currentListeners = this.channelListeners.get(channel);
        if (currentListeners) {
          currentListeners.delete(subject);
          if (currentListeners.size === 0) {
            this.channelListeners.delete(channel);
            this.redisSubClient.unsubscribe(channel).catch((err: Error) => {
              logToConsoleBackend({
                log: new ServerError({
                  message: ErEnum.BACKEND_AGENT_REDIS_UNSUBSCRIBE_FAILED,
                  originalError: err
                }),
                logLevel: LogLevelEnum.Error,
                logger: this.logger,
                cs: this.cs
              });
            });
          }
        }
      };
    });
  }
}
