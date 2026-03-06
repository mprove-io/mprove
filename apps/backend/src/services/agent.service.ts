import crypto from 'node:crypto';
import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  Event,
  EventMessagePartDelta,
  EventMessagePartUpdated,
  EventMessageUpdated,
  EventPermissionAsked,
  EventPermissionReplied,
  EventQuestionAsked,
  EventQuestionRejected,
  EventQuestionReplied,
  EventSessionError,
  EventSessionStatus,
  EventSessionUpdated,
  EventTodoUpdated,
  Part,
  PermissionRequest,
  QuestionRequest
} from '@opencode-ai/sdk/v2';
import { and, asc, eq, gt, inArray, lt, max, sql } from 'drizzle-orm';
import { Redis } from 'ioredis';
import { Observable, Subject } from 'rxjs';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  OcMessageTab,
  OcPartTab,
  OcSessionTab,
  SessionTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { ocEventsTable } from '#backend/drizzle/postgres/schema/oc-events.js';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions.js';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { ArchivedReasonEnum } from '#common/enums/archived-reason.enum';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ServerError } from '#common/models/server-error';
import { OcEventsService } from './db/oc-events.service';
import { OcMessagesService } from './db/oc-messages.service';
import { OcPartsService } from './db/oc-parts.service';
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
  private podId = crypto.randomUUID();

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
    private ocEventsService: OcEventsService,
    private ocMessagesService: OcMessagesService,
    private ocPartsService: OcPartsService,
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

    this.drainTimer = setInterval(() => {
      this.drainAllQueues().catch(e => {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_AGENT_DRAIN_QUEUES_FAILED,
            originalError: e
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      });

      this.refreshStreamLocks().catch(e => {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_AGENT_REFRESH_STREAM_LOCKS_FAILED,
            originalError: e
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      });
    }, 1000);
  }

  // pub/sub

  private channelName(sessionId: string): string {
    return `agent-events:${sessionId}`;
  }

  private streamLockKey(sessionId: string): string {
    return `stream-owner:${sessionId}`;
  }

  private async tryAcquireStreamLock(sessionId: string): Promise<boolean> {
    let result = await this.redisPubClient.set(
      this.streamLockKey(sessionId),
      this.podId,
      'EX',
      10,
      'NX'
    );
    return result === 'OK';
  }

  private async refreshStreamLocks(): Promise<void> {
    for (let sessionId of this.activeStreams.keys()) {
      await this.redisPubClient.eval(
        `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("expire", KEYS[1], 10) else return 0 end`,
        1,
        this.streamLockKey(sessionId),
        this.podId
      );
    }
  }

  private async releaseStreamLock(sessionId: string): Promise<void> {
    await this.redisPubClient.eval(
      `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end`,
      1,
      this.streamLockKey(sessionId),
      this.podId
    );
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

      return () => {
        subscription.unsubscribe();
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

  subscribeWithBackfill(
    sessionId: string,
    lastEventIndex: number
  ): Observable<AgentEvent> {
    let channel = this.channelName(sessionId);

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
      this.getEventsSince(sessionId, lastEventIndex)
        .then(dbEvents => {
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
        })
        .catch(err => {
          observer.error(err);
        });

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

  private async getEventsSince(
    sessionId: string,
    lastEventIndex: number
  ): Promise<AgentEvent[]> {
    let eventEnts = await this.db.drizzle.query.ocEventsTable.findMany({
      where: and(
        eq(ocEventsTable.sessionId, sessionId),
        gt(ocEventsTable.eventIndex, lastEventIndex)
      ),
      orderBy: [asc(ocEventsTable.eventIndex)]
    });

    return eventEnts.map(ent => {
      let tab = this.tabService.ocEventEntToTab(ent);
      return {
        eventId: tab.eventId,
        eventIndex: tab.eventIndex,
        eventType: tab.type,
        ocEvent: tab.ocEvent
      };
    });
  }

  // stream

  async startEventStream(item: { sessionId: string }): Promise<void> {
    if (this.activeStreams.has(item.sessionId)) {
      return;
    }

    let acquired = await this.tryAcquireStreamLock(item.sessionId);
    if (!acquired) {
      return;
    }

    let client = this.sandboxService.getOpenCodeClientCheckExists(
      item.sessionId
    );

    let abortController = new AbortController();

    let eventIndex = this.eventCounters.get(item.sessionId);
    if (eventIndex === undefined) {
      let maxRow = await this.db.drizzle
        .select({ maxIndex: max(ocEventsTable.eventIndex) })
        .from(ocEventsTable)
        .where(eq(ocEventsTable.sessionId, item.sessionId));
      eventIndex = maxRow[0]?.maxIndex != null ? maxRow[0].maxIndex + 1 : 0;
    }

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
          logToConsoleBackend({
            log: new ServerError({
              message: ErEnum.BACKEND_AGENT_SSE_STREAM_ERROR,
              originalError: e
            }),
            logLevel: LogLevelEnum.Error,
            logger: this.logger,
            cs: this.cs
          });
        } else {
          logToConsoleBackend({
            log: new ServerError({
              message: ErEnum.BACKEND_AGENT_SSE_STREAM_ABORT,
              originalError: e
            }),
            logLevel: LogLevelEnum.Error,
            logger: this.logger,
            cs: this.cs
          });
        }
      }

      await this.stopEventStream(item.sessionId);
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
    this.sandboxService.disposeOpenCodeClient(sessionId);
    await this.releaseStreamLock(sessionId);
  }

  async respondToPermission(item: {
    sessionId: string;
    opencodeSessionId: string;
    permissionId: string;
    reply: string;
  }): Promise<void> {
    let client = this.sandboxService.getOpenCodeClientCheckExists(
      item.sessionId
    );

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
    let client = this.sandboxService.getOpenCodeClientCheckExists(
      item.sessionId
    );

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
    let client = this.sandboxService.getOpenCodeClientCheckExists(
      item.sessionId
    );

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

    let itemCount = queue.length;
    let items = queue.slice(0, itemCount);

    let eventTabs = items.map(item =>
      this.ocEventsService.makeOcEvent({
        sessionId: item.sessionId,
        event: item.event,
        eventIndex: item.eventIndex
      })
    );

    let uniqueMessages: OcMessageTab[] = [];

    for (let item of items.filter(i => i.event.type === 'message.updated')) {
      let props = (item.event as EventMessageUpdated).properties;
      let tab = this.ocMessagesService.makeOcMessage({
        messageId: props.info.id,
        sessionId: sessionId,
        role: props.info.role,
        ocMessage: props.info
      });
      let idx = uniqueMessages.findIndex(m => m.messageId === tab.messageId);
      if (idx >= 0) {
        uniqueMessages[idx] = tab;
      } else {
        uniqueMessages.push(tab);
      }
    }

    let messageTabs = uniqueMessages;

    // Accumulate part states across drain cycles (updates + deltas)
    let sessionParts = this.partStates.get(sessionId);
    if (!sessionParts) {
      sessionParts = new Map();
      this.partStates.set(sessionId, sessionParts);
    }

    // Snapshot partStates before delta accumulation for rollback on failure
    let savedParts = new Map<string, Part>();
    for (let [k, v] of sessionParts) {
      savedParts.set(k, { ...v });
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

    let partTabs: OcPartTab[] = [];
    for (let partId of touchedPartIds) {
      let part = sessionParts.get(partId);
      if (part) {
        partTabs.push(
          this.ocPartsService.makeOcPart({
            partId: part.id as string,
            messageId: part.messageID as string,
            sessionId: sessionId,
            ocPart: part as EventMessagePartUpdated['properties']['part']
          })
        );
      }
    }

    let ocSessionTabs: OcSessionTab[] = [];

    let sessionUpdatedItems = items.filter(
      item => item.event.type === 'session.updated'
    );
    let todoItems = items.filter(item => item.event.type === 'todo.updated');
    let questionAskedItems = items.filter(
      item => item.event.type === 'question.asked'
    );
    let questionResolvedItems = items.filter(
      item =>
        item.event.type === 'question.replied' ||
        item.event.type === 'question.rejected'
    );
    let permissionAskedItems = items.filter(
      item => item.event.type === 'permission.asked'
    );
    let permissionRepliedItems = items.filter(
      item => item.event.type === 'permission.replied'
    );
    let sessionStatusItems = items.filter(
      item => item.event.type === 'session.status'
    );
    let sessionErrorItems = items.filter(
      item => item.event.type === 'session.error'
    );

    if (
      sessionUpdatedItems.length > 0 ||
      todoItems.length > 0 ||
      questionAskedItems.length > 0 ||
      questionResolvedItems.length > 0 ||
      permissionAskedItems.length > 0 ||
      permissionRepliedItems.length > 0 ||
      sessionStatusItems.length > 0 ||
      sessionErrorItems.length > 0
    ) {
      let ocSessionTab = await this.sessionsService.getOcSessionBySessionId({
        sessionId: sessionId
      });

      if (!ocSessionTab) {
        ocSessionTab = this.sessionsService.makeOcSession({ sessionId });
      }

      if (sessionUpdatedItems.length > 0) {
        let lastItem = sessionUpdatedItems[sessionUpdatedItems.length - 1];
        let ocSessionData = (lastItem.event as EventSessionUpdated).properties
          .info;
        ocSessionTabs.push({ ...ocSessionTab, openSession: ocSessionData });
      }

      if (todoItems.length > 0) {
        let lastTodoEvent = todoItems[todoItems.length - 1];
        let todos =
          (lastTodoEvent.event as EventTodoUpdated).properties.todos ?? [];
        let existingIndex = ocSessionTabs.findIndex(
          t => t.sessionId === sessionId
        );
        if (existingIndex >= 0) {
          ocSessionTabs[existingIndex] = {
            ...ocSessionTabs[existingIndex],
            todos
          };
        } else {
          ocSessionTabs.push({ ...ocSessionTab, todos });
        }
      }

      if (questionAskedItems.length > 0 || questionResolvedItems.length > 0) {
        let existingIndex = ocSessionTabs.findIndex(
          t => t.sessionId === sessionId
        );
        let base =
          existingIndex >= 0 ? ocSessionTabs[existingIndex] : ocSessionTab;
        let questions: QuestionRequest[] = base.questions
          ? [...base.questions]
          : [];

        for (let item of questionAskedItems) {
          let q = (item.event as EventQuestionAsked).properties;
          let idx = questions.findIndex(x => x.id === q.id);
          if (idx >= 0) {
            questions[idx] = q;
          } else {
            questions.push(q);
          }
        }

        for (let item of questionResolvedItems) {
          let props = (
            item.event as EventQuestionReplied | EventQuestionRejected
          ).properties;
          questions = questions.filter(x => x.id !== props.requestID);
        }

        if (existingIndex >= 0) {
          ocSessionTabs[existingIndex] = {
            ...ocSessionTabs[existingIndex],
            questions
          };
        } else {
          ocSessionTabs.push({ ...ocSessionTab, questions });
        }
      }

      if (
        permissionAskedItems.length > 0 ||
        permissionRepliedItems.length > 0
      ) {
        let existingIndex = ocSessionTabs.findIndex(
          t => t.sessionId === sessionId
        );
        let base =
          existingIndex >= 0 ? ocSessionTabs[existingIndex] : ocSessionTab;
        let permissions: PermissionRequest[] = base.permissions
          ? [...base.permissions]
          : [];

        for (let item of permissionAskedItems) {
          let p = (item.event as EventPermissionAsked).properties;
          let idx = permissions.findIndex(x => x.id === p.id);
          if (idx >= 0) {
            permissions[idx] = p;
          } else {
            permissions.push(p);
          }
        }

        for (let item of permissionRepliedItems) {
          let props = (item.event as EventPermissionReplied).properties;
          permissions = permissions.filter(x => x.id !== props.requestID);
        }

        if (existingIndex >= 0) {
          ocSessionTabs[existingIndex] = {
            ...ocSessionTabs[existingIndex],
            permissions
          };
        } else {
          ocSessionTabs.push({ ...ocSessionTab, permissions });
        }
      }

      if (sessionErrorItems.length > 0 || sessionStatusItems.length > 0) {
        let existingIndex = ocSessionTabs.findIndex(
          t => t.sessionId === sessionId
        );
        let base =
          existingIndex >= 0 ? ocSessionTabs[existingIndex] : ocSessionTab;

        let lastSessionError = base.lastSessionError;
        let isLastErrorRecovered = base.isLastErrorRecovered;
        let ocSessionStatus = base.ocSessionStatus;

        if (sessionErrorItems.length > 0) {
          let lastErrorItem = sessionErrorItems[sessionErrorItems.length - 1];
          let errorProps = (lastErrorItem.event as EventSessionError)
            .properties;
          lastSessionError = errorProps.error as
            | Record<string, unknown>
            | undefined;
          isLastErrorRecovered = false;
        }

        if (sessionStatusItems.length > 0) {
          let lastStatusItem =
            sessionStatusItems[sessionStatusItems.length - 1];
          let statusProps = (lastStatusItem.event as EventSessionStatus)
            .properties;
          ocSessionStatus = statusProps.status;

          if (statusProps.status.type === 'idle' && lastSessionError) {
            isLastErrorRecovered = true;
          }
        }

        if (existingIndex >= 0) {
          ocSessionTabs[existingIndex] = {
            ...ocSessionTabs[existingIndex],
            ocSessionStatus,
            lastSessionError,
            isLastErrorRecovered
          };
        } else {
          ocSessionTabs.push({
            ...ocSessionTab,
            ocSessionStatus,
            lastSessionError,
            isLastErrorRecovered
          });
        }
      }
    }

    let hasActivityEvents =
      messageTabs.length > 0 ||
      partTabs.length > 0 ||
      todoItems.length > 0 ||
      questionAskedItems.length > 0 ||
      permissionAskedItems.length > 0;

    try {
      await this.db.drizzle.transaction(async tx => {
        await this.db.packer.write({
          tx: tx,
          insert: {
            ocEvents: eventTabs
          },
          insertOrUpdate: {
            ocMessages: messageTabs,
            ocParts: partTabs,
            ocSessions: ocSessionTabs
          }
        });

        if (hasActivityEvents) {
          let now = Date.now();

          await tx.execute(
            sql`UPDATE sessions SET last_activity_ts = ${now} WHERE session_id = ${sessionId}`
          );
        }
      });
    } catch (e) {
      // Restore partStates snapshot so deltas aren't doubled on retry
      this.partStates.set(sessionId, savedParts);
      throw e;
    }

    queue.splice(0, itemCount);

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
    let sessionPauseThresholdMinutes = this.cs.get<
      BackendConfig['sessionPauseThresholdMinutes']
    >('sessionPauseThresholdMinutes');

    let pauseThresholdTs =
      Date.now() - sessionPauseThresholdMinutes * 60 * 1000;

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

  async syncSandboxStatuses(): Promise<void> {
    let sessions = await this.db.drizzle.query.sessionsTable
      .findMany({
        where: inArray(sessionsTable.status, [
          SessionStatusEnum.Active,
          SessionStatusEnum.Paused
        ])
      })
      .then(xs => xs.map(x => this.tabService.sessionEntToTab(x)));

    // Collect unique projectIds
    let projectIds = [
      ...new Set(sessions.filter(s => s.sandboxId).map(s => s.projectId))
    ];

    for (let projectId of projectIds) {
      try {
        let project = await this.projectsService.getProjectCheckExists({
          projectId: projectId
        });

        await this.syncProjectSandboxStatuses({
          projectId: projectId,
          e2bApiKey: project.e2bApiKey
        });
      } catch (e) {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_SCHEDULER_SYNC_SANDBOX_STATUSES_FAILED,
            originalError: e
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      }
    }
  }

  async syncProjectSandboxStatuses(item: {
    projectId: string;
    e2bApiKey: string;
  }): Promise<void> {
    let sessions = await this.db.drizzle.query.sessionsTable
      .findMany({
        where: and(
          eq(sessionsTable.projectId, item.projectId),
          inArray(sessionsTable.status, [
            SessionStatusEnum.Active,
            SessionStatusEnum.Paused
          ])
        )
      })
      .then(xs => xs.map(x => this.tabService.sessionEntToTab(x)));

    let sessionsWithSandbox = sessions.filter(s => s.sandboxId);

    if (sessionsWithSandbox.length === 0) {
      return;
    }

    let sandboxes = await this.sandboxService.listSandboxes({
      e2bApiKey: item.e2bApiKey
    });

    for (let session of sessionsWithSandbox) {
      try {
        let sandboxInfo = sandboxes.find(
          s => s.sandboxId === session.sandboxId
        );

        if (!sandboxInfo) {
          // Sandbox no longer exists
          let updatedSession: SessionTab = {
            ...session,
            status: SessionStatusEnum.Archived,
            archivedReason: ArchivedReasonEnum.Expire
          };

          await this.db.drizzle.transaction(async tx => {
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                sessions: [updatedSession]
              }
            });

            await tx
              .delete(ocEventsTable)
              .where(and(eq(ocEventsTable.sessionId, session.sessionId)));
          });
        } else if (
          session.status === SessionStatusEnum.Active &&
          sandboxInfo.state === 'paused'
        ) {
          let updatedSession: SessionTab = {
            ...session,
            status: SessionStatusEnum.Paused,
            sandboxStartTs: sandboxInfo.startedAt.getTime(),
            sandboxEndTs: sandboxInfo.endAt.getTime(),
            sandboxInfo: sandboxInfo
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
      } catch (e) {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_SCHEDULER_SYNC_SANDBOX_STATUS_FAILED,
            originalError: e
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      }
    }
  }

  onModuleDestroy() {
    clearInterval(this.drainTimer);
    this.redisPubClient.disconnect();
    this.redisSubClient.disconnect();
  }
}
