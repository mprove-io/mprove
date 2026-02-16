import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, lt } from 'drizzle-orm';
import { Redis } from 'ioredis';
import { Observable, Subject } from 'rxjs';
import type { SessionEvent } from 'sandbox-agent';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { SessionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions.js';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { EventsService } from './db/events.service';
import { ProjectsService } from './db/projects.service';
import { SessionsService } from './db/sessions.service';
import { SandboxService } from './sandbox.service';
import { TabService } from './tab.service';

export interface AgentEvent {
  eventId: string;
  eventIndex: number;
  sender: SessionEvent['sender'];
  payload: SessionEvent['payload'];
}

@Injectable()
export class AgentService implements OnModuleDestroy {
  private redisPubClient: Redis;
  private redisSubClient: Redis;

  private channelListeners = new Map<string, Set<Subject<AgentEvent>>>();

  private activeStreams = new Map<string, () => void>();

  constructor(
    private cs: ConfigService<BackendConfig>,
    private eventsService: EventsService,
    private sessionsService: SessionsService,
    private tabService: TabService,
    private projectsService: ProjectsService,
    private sandboxService: SandboxService,
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
      this.logger.warn(`Redis sub client error: ${err.message}`);
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

  // pub/sub

  private channelName(sessionId: string): string {
    return `agent-events:${sessionId}`;
  }

  async publish(sessionId: string, event: AgentEvent): Promise<void> {
    await this.redisPubClient.publish(
      this.channelName(sessionId),
      JSON.stringify(event)
    );
  }

  subscribe(sessionId: string): Observable<AgentEvent> {
    let channel = this.channelName(sessionId);

    return new Observable<AgentEvent>(observer => {
      let subject = new Subject<AgentEvent>();
      let subscription = subject.subscribe(observer);

      let listeners = this.channelListeners.get(channel);

      if (listeners) {
        listeners.add(subject);
      } else {
        listeners = new Set([subject]);
        this.channelListeners.set(channel, listeners);
        this.redisSubClient.subscribe(channel).catch((err: Error) => {
          this.logger.warn(
            `Redis subscribe failed for session ${sessionId}: ${err.message}`
          );
        });
      }

      return () => {
        subscription.unsubscribe();
        subject.complete();

        let currentListeners = this.channelListeners.get(channel);
        if (currentListeners) {
          currentListeners.delete(subject);
          if (currentListeners.size === 0) {
            this.channelListeners.delete(channel);
            this.redisSubClient.unsubscribe(channel).catch((err: Error) => {
              this.logger.warn(
                `Redis unsubscribe failed for session ${sessionId}: ${err.message}`
              );
            });
          }
        }
      };
    });
  }

  // stream

  startEventStream(item: { sessionId: string; offset?: number }): void {
    this.stopEventStream(item.sessionId);

    let sandboxAgent = this.sandboxService.getSandboxAgent(item.sessionId);

    let sessionEventHandler = sandboxAgent.onSessionEvent(
      item.sessionId,
      event => {
        this.storeEvent({
          sessionId: item.sessionId,
          event: event
        }).catch(e => {
          this.logger.warn(
            `Failed to store event for session ${item.sessionId}: ${e?.message}`
          );
        });
      }
    );

    this.activeStreams.set(item.sessionId, sessionEventHandler);
  }

  stopEventStream(sessionId: string): void {
    let sessionEventHandler = this.activeStreams.get(sessionId);

    if (sessionEventHandler) {
      sessionEventHandler();

      this.activeStreams.delete(sessionId);
    }
  }

  private async storeEvent(item: {
    sessionId: string;
    event: SessionEvent;
  }): Promise<void> {
    let eventTab = this.eventsService.makeEvent({
      sessionId: item.sessionId,
      event: item.event
    });

    await this.db.drizzle.transaction(async tx =>
      this.db.packer.write({
        tx: tx,
        insert: {
          events: [eventTab]
        }
      })
    );

    await this.publish(item.sessionId, {
      eventId: item.event.id,
      eventIndex: item.event.eventIndex,
      sender: item.event.sender,
      payload: item.event.payload
    });
  }

  // Scheduled task

  async pauseIdleSessions(): Promise<void> {
    let idleMinutes =
      this.cs.get<BackendConfig['sandboxIdleMinutes']>('sandboxIdleMinutes');

    let pauseThresholdTs = Date.now() - idleMinutes * 60 * 1000;

    let sessionsToPause = await this.db.drizzle.query.sessionsTable
      .findMany({
        where: and(
          eq(sessionsTable.status, SessionStatusEnum.Active),
          lt(sessionsTable.lastActivityTs, pauseThresholdTs)
        )
      })
      .then(xs => xs.map(x => this.tabService.sessionEntToTab(x)));

    for (let session of sessionsToPause) {
      if (
        session.lastActivityTs &&
        session.lastActivityTs < pauseThresholdTs &&
        session.sandboxId
      ) {
        let project = await this.projectsService.getProjectCheckExists({
          projectId: session.projectId
        });

        this.stopEventStream(session.sessionId);

        await this.sandboxService.disposeSandboxAgent(session.sessionId);

        await this.sandboxService.pauseSandbox({
          sandboxType: session.sandboxType as SandboxTypeEnum,
          sandboxId: session.sandboxId,
          e2bApiKey: project.e2bApiKey
        });

        let updatedSession: SessionTab = {
          ...session,
          status: SessionStatusEnum.Paused
        };

        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                sessions: [updatedSession]
              }
            })
        );
      }
    }
  }

  onModuleDestroy() {
    this.redisPubClient.disconnect();
    this.redisSubClient.disconnect();
  }
}
