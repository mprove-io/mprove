import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  Event,
  EventMessagePartDelta,
  EventMessagePartUpdated,
  EventMessageUpdated,
  Part
} from '@opencode-ai/sdk/v2';
import { and, eq, lt } from 'drizzle-orm';
import { Redis } from 'ioredis';
import { Observable, Subject } from 'rxjs';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  PartTab,
  SessionTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions.js';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { EventsService } from './db/events.service';
import { MessagesService } from './db/messages.service';
import { PartsService } from './db/parts.service';
import { ProjectsService } from './db/projects.service';
import { SessionsService } from './db/sessions.service';
import { SandboxService } from './sandbox.service';
import { TabService } from './tab.service';

export interface AgentEvent {
  eventId: string;
  eventIndex: number;
  eventType: string;
  ocEvent: Event;
}

@Injectable()
export class AgentService implements OnModuleDestroy {
  private redisPubClient: Redis;
  private redisSubClient: Redis;

  private channelListeners = new Map<string, Set<Subject<AgentEvent>>>();

  private activeStreams = new Map<string, () => void>();

  private pendingEvents = new Map<
    string,
    { sessionId: string; event: Event; eventIndex: number }[]
  >();

  private eventCounters = new Map<string, number>();

  private partStates = new Map<string, Map<string, Part>>();

  private drainTimer: ReturnType<typeof setInterval>;

  constructor(
    private cs: ConfigService<BackendConfig>,
    private eventsService: EventsService,
    private messagesService: MessagesService,
    private partsService: PartsService,
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
      console.log(`Redis sub client error: ${err.message}`);
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

    this.drainTimer = setInterval(() => {
      this.drainAllQueues().catch(e => {
        console.log(`Failed to drain event queues: ${e?.message}`);
      });
    }, 1000);
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
          console.log(
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
              console.log(
                `Redis unsubscribe failed for session ${sessionId}: ${err.message}`
              );
            });
          }
        }
      };
    });
  }

  // stream

  async startEventStream(item: { sessionId: string }): Promise<void> {
    await this.stopEventStream(item.sessionId);

    let client = this.sandboxService.getOpenCodeClient(item.sessionId);

    let abortController = new AbortController();

    let eventIndex = this.eventCounters.get(item.sessionId) ?? 0;

    let response = await client.event.subscribe(
      {},
      { signal: abortController.signal }
    );

    let processStream = async () => {
      try {
        for await (let event of response.stream) {
          let queue = this.pendingEvents.get(item.sessionId);
          if (!queue) {
            queue = [];
            this.pendingEvents.set(item.sessionId, queue);
          }
          queue.push({
            sessionId: item.sessionId,
            event: event,
            eventIndex: eventIndex
          });
          eventIndex++;
          this.eventCounters.set(item.sessionId, eventIndex);
        }
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.log(`SSE stream error: ${e?.message}`);
        }
      }
    };

    processStream();

    this.activeStreams.set(item.sessionId, () => abortController.abort());
  }

  async stopEventStream(sessionId: string): Promise<void> {
    let stopFn = this.activeStreams.get(sessionId);

    if (stopFn) {
      stopFn();
      this.activeStreams.delete(sessionId);
    }

    await this.drainQueue(sessionId);
    this.pendingEvents.delete(sessionId);
    this.eventCounters.delete(sessionId);
    this.partStates.delete(sessionId);
  }

  async respondToPermission(item: {
    sessionId: string;
    opencodeSessionId: string;
    permissionId: string;
    reply: string;
  }): Promise<void> {
    let client = this.sandboxService.getOpenCodeClient(item.sessionId);

    await client.permission.respond({
      sessionID: item.opencodeSessionId,
      permissionID: item.permissionId,
      response: item.reply as 'always' | 'once' | 'reject'
    });
  }

  async respondToQuestion(item: {
    sessionId: string;
    opencodeSessionId: string;
    questionId: string;
    answers: string[][];
  }): Promise<void> {
    let client = this.sandboxService.getOpenCodeClient(item.sessionId);

    await client.question.reply({
      requestID: item.questionId,
      answers: item.answers
    });
  }

  async rejectQuestion(item: {
    sessionId: string;
    opencodeSessionId: string;
    questionId: string;
  }): Promise<void> {
    let client = this.sandboxService.getOpenCodeClient(item.sessionId);

    await client.question.reject({
      requestID: item.questionId
    });
  }

  private async drainAllQueues(): Promise<void> {
    for (let sessionId of Array.from(this.pendingEvents.keys())) {
      await this.drainQueue(sessionId);
    }
  }

  private async drainQueue(sessionId: string): Promise<void> {
    let queue = this.pendingEvents.get(sessionId);
    if (!queue || queue.length === 0) {
      return;
    }

    let items = queue.splice(0);

    let eventTabs = items.map(item =>
      this.eventsService.makeEvent({
        sessionId: item.sessionId,
        event: item.event,
        eventIndex: item.eventIndex
      })
    );

    let messageTabs = items
      .filter(item => item.event.type === 'message.updated')
      .map(item => {
        let props = (item.event as EventMessageUpdated).properties;
        return this.messagesService.makeMessage({
          messageId: props.info.id,
          sessionId: sessionId,
          role: props.info.role,
          ocMessage: props.info
        });
      });

    // Accumulate part states across drain cycles (updates + deltas)
    let sessionParts = this.partStates.get(sessionId);
    if (!sessionParts) {
      sessionParts = new Map();
      this.partStates.set(sessionId, sessionParts);
    }

    let touchedPartIds = new Set<string>();

    for (let item of items) {
      if (item.event.type === 'message.part.updated') {
        let props = (item.event as EventMessagePartUpdated).properties;
        sessionParts.set(props.part.id, { ...props.part });
        touchedPartIds.add(props.part.id);
      } else if (item.event.type === 'message.part.delta') {
        let props = (item.event as EventMessagePartDelta).properties;
        let existing = sessionParts.get(props.partID);
        if (existing) {
          let field = props.field as keyof typeof existing;
          let current = existing[field] as string | undefined;
          (existing[field] as string) = (current ?? '') + props.delta;
          touchedPartIds.add(props.partID);
        }
      }
    }

    let partTabs: PartTab[] = [];
    for (let partId of touchedPartIds) {
      let part = sessionParts.get(partId);
      if (part) {
        partTabs.push(
          this.partsService.makePart({
            partId: part.id as string,
            messageId: part.messageID as string,
            sessionId: sessionId,
            ocPart: part as EventMessagePartUpdated['properties']['part']
          })
        );
      }
    }

    await this.db.drizzle.transaction(async tx => {
      await this.db.packer.write({
        tx: tx,
        insert: {
          events: eventTabs
        }
      });

      if (messageTabs.length > 0) {
        await this.db.packer.write({
          tx: tx,
          insertOrUpdate: {
            messages: messageTabs
          }
        });
      }

      if (partTabs.length > 0) {
        await this.db.packer.write({
          tx: tx,
          insertOrUpdate: {
            parts: partTabs
          }
        });
      }
    });

    for (let item of items) {
      let eventId = `${item.sessionId}_${item.eventIndex}`;
      await this.publish(item.sessionId, {
        eventId: eventId,
        eventIndex: item.eventIndex,
        eventType: item.event.type,
        ocEvent: item.event
      });
    }
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

        await this.stopEventStream(session.sessionId);

        this.sandboxService.disposeOpenCodeClient(session.sessionId);

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
    clearInterval(this.drainTimer);
    this.redisPubClient.disconnect();
    this.redisSubClient.disconnect();
  }
}
