import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { Observable, Subject } from 'rxjs';
import type {
  UniversalEvent,
  UniversalEventData,
  UniversalEventType
} from 'sandbox-agent';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  EventTab,
  SessionTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ProjectsService } from './db/projects.service';
import { SessionsService } from './db/sessions.service';
import { SandboxService } from './sandbox.service';

export interface AgentEvent {
  eventId: string;
  sequence: number;
  type: UniversalEventType;
  eventData: UniversalEventData;
}

@Injectable()
export class AgentService implements OnModuleDestroy {
  private redisClient: Redis;
  private activeStreams = new Map<string, AbortController>();

  constructor(
    private cs: ConfigService<BackendConfig>,
    private sessionsService: SessionsService,
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

    this.redisClient = new Redis({
      host: valkeyHost,
      port: 6379,
      password: valkeyPassword
    });
  }

  // pub/sub

  private channelName(sessionId: string): string {
    return `agent-events:${sessionId}`;
  }

  async publish(sessionId: string, event: AgentEvent): Promise<void> {
    await this.redisClient.publish(
      this.channelName(sessionId),
      JSON.stringify(event)
    );
  }

  subscribe(sessionId: string): Observable<AgentEvent> {
    let channel = this.channelName(sessionId);
    let subject = new Subject<AgentEvent>();

    let sub = this.redisClient.duplicate();

    sub.subscribe(channel).then(() => {
      sub.on('message', (_ch: string, message: string) => {
        subject.next(JSON.parse(message) as AgentEvent);
      });
    });

    return new Observable<AgentEvent>(observer => {
      let subscription = subject.subscribe(observer);

      return () => {
        subscription.unsubscribe();
        sub.unsubscribe(channel).then(() => sub.quit());
      };
    });
  }

  // stream

  startEventStream(item: { sessionId: string; offset?: number }): void {
    this.stopEventStream(item.sessionId);

    let abortController = new AbortController();
    this.activeStreams.set(item.sessionId, abortController);

    this.runEventStreamLoop({
      sessionId: item.sessionId,
      offset: item.offset ?? 0,
      signal: abortController.signal
    }).catch(e => {
      this.logger.warn(
        `Event stream ended for session ${item.sessionId}: ${e?.message}`
      );
    });
  }

  stopEventStream(sessionId: string): void {
    let controller = this.activeStreams.get(sessionId);
    if (controller) {
      controller.abort();
      this.activeStreams.delete(sessionId);
    }
  }

  private async runEventStreamLoop(item: {
    sessionId: string;
    offset: number;
    signal: AbortSignal;
  }): Promise<void> {
    let client = this.sandboxService.getSaClient(item.sessionId);
    let currentOffset = item.offset;

    let stream = client.streamEvents(
      item.sessionId,
      { offset: currentOffset },
      item.signal
    );

    for await (let event of stream) {
      if (item.signal.aborted) {
        break;
      }

      await this.storeEvent({
        sessionId: item.sessionId,
        event: event
      });

      currentOffset = event.sequence;
    }
  }

  private async storeEvent(item: {
    sessionId: string;
    event: UniversalEvent;
  }): Promise<void> {
    let now = Date.now();

    let eventTab = {
      eventId: item.event.event_id,
      sessionId: item.sessionId,
      sequence: item.event.sequence,
      type: item.event.type,
      universalEvent: item.event,
      createdTs: now,
      serverTs: now
    } as EventTab;

    await this.db.drizzle.transaction(async tx =>
      this.db.packer.write({
        tx: tx,
        insert: {
          events: [eventTab]
        }
      })
    );

    await this.publish(item.sessionId, {
      eventId: item.event.event_id,
      sequence: item.event.sequence,
      type: item.event.type,
      eventData: item.event.data
    });
  }

  // Scheduled task

  async pauseIdleSessions(): Promise<void> {
    let idleMinutes =
      this.cs.get<BackendConfig['sandboxIdleMinutes']>('sandboxIdleMinutes');

    let idleThresholdTs = Date.now() - idleMinutes * 60 * 1000;

    let sessions = await this.sessionsService.getIdleActiveSessions({
      idleThresholdTs
    });

    for (let session of sessions) {
      if (
        session.lastActivityTs &&
        session.lastActivityTs < idleThresholdTs &&
        session.sandboxId
      ) {
        let project = await this.projectsService.getProjectCheckExists({
          projectId: session.projectId
        });

        this.stopEventStream(session.sessionId);

        await this.sandboxService.disposeSaClient(session.sessionId);

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
    this.redisClient.disconnect();
  }
}
