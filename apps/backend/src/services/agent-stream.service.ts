import crypto from 'node:crypto';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { BackendConfig } from '#backend/config/backend-config';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { RELOAD_SESSION_EVENT_TYPE } from '#common/constants/top';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ServerError } from '#common/models/server-error';
import { AgentEventsService } from './agent-events.service';
import { AgentSandboxService } from './agent-sandbox.service';
import { AgentSandboxLifecycleService } from './agent-sandbox-lifecycle.service';
import { AgentStreamDrainService } from './agent-stream-drain.service';

@Injectable()
export class AgentStreamService implements OnModuleDestroy {
  private podId = crypto.randomUUID();

  // OpenCode sends heartbeat every 10s (hardcoded in workspace-server/routes.ts) + 4s buffer
  private static STREAM_STALL_THRESHOLD_MS = 14_000;
  private static STREAM_LOCK_TTL_SECONDS = 16;
  private static STREAM_LOCK_WAIT_TIMEOUT_MS = 18_000;

  private static STOP_STREAM_CHANNEL = 'stop-stream';

  private redisClient: Redis;

  private redisSubscriber: Redis;

  private activeStreams = new Map<string, () => void>();

  private lastEventTsMap = new Map<string, number>();

  private isRunningDrain = false;

  private drainTimer: ReturnType<typeof setInterval>;

  constructor(
    private cs: ConfigService<BackendConfig>,
    private agentDrainService: AgentStreamDrainService,
    private agentEventsService: AgentEventsService,
    private agentSandboxLifecycleService: AgentSandboxLifecycleService,
    private agentSandboxService: AgentSandboxService,
    private logger: Logger
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

    this.redisSubscriber = new Redis({
      host: valkeyHost,
      port: 6379,
      password: valkeyPassword
    });

    this.redisSubscriber.subscribe(AgentStreamService.STOP_STREAM_CHANNEL);

    this.redisSubscriber.on('message', (_channel, sessionId) => {
      if (this.activeStreams.has(sessionId)) {
        console.log(
          `[stop-stream] received pub/sub stop for sessionId=${sessionId}`
        );

        this.stopEventStream(sessionId).catch(e => {
          logToConsoleBackend({
            log: new ServerError({
              message: ErEnum.BACKEND_AGENT_STOP_STREAM_PUBSUB_FAILED,
              originalError: e
            }),
            logLevel: LogLevelEnum.Error,
            logger: this.logger,
            cs: this.cs
          });
        });
      }
    });

    this.drainTimer = setInterval(async () => {
      if (this.isRunningDrain === false) {
        this.isRunningDrain = true;

        try {
          let safePauseSessionIds =
            await this.agentDrainService.drainAllQueues();

          for (let sessionId of safePauseSessionIds) {
            try {
              await this.stopEventStream(sessionId);
              await this.agentSandboxLifecycleService.pauseSessionById({
                sessionId
              });
            } catch (e) {
              logToConsoleBackend({
                log: new ServerError({
                  message: ErEnum.BACKEND_AGENT_SAFE_PAUSE_SESSION_FAILED,
                  originalError: e
                }),
                logLevel: LogLevelEnum.Error,
                logger: this.logger,
                cs: this.cs
              });
            }
          }
        } catch (e) {
          logToConsoleBackend({
            log: new ServerError({
              message: ErEnum.BACKEND_AGENT_DRAIN_QUEUES_FAILED,
              originalError: e
            }),
            logLevel: LogLevelEnum.Error,
            logger: this.logger,
            cs: this.cs
          });
        }

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

        this.checkStreamStalls().catch(e => {
          logToConsoleBackend({
            log: new ServerError({
              message: ErEnum.BACKEND_AGENT_STREAM_STALL_CHECK_FAILED,
              originalError: e
            }),
            logLevel: LogLevelEnum.Error,
            logger: this.logger,
            cs: this.cs
          });
        });

        this.isRunningDrain = false;
      }
    }, 1000);
  }

  async publishStopSessionStream(item: {
    sessionId: string;
  }): Promise<boolean> {
    let key = this.makeStreamLockKey(item.sessionId);
    let exists = await this.redisClient.exists(key);

    if (exists === 0) {
      return false;
    }

    await this.redisClient.publish(
      AgentStreamService.STOP_STREAM_CHANNEL,
      item.sessionId
    );

    return true;
  }

  private async publishReloadSession(item: {
    sessionId: string;
    eventIndex: number;
  }): Promise<void> {
    console.log(
      `[publishReloadSession] publishing reload for sessionId=${item.sessionId}`
    );

    await this.agentEventsService.publish(item.sessionId, {
      eventId: `${item.sessionId}_${item.eventIndex}`,
      eventIndex: item.eventIndex,
      eventType: RELOAD_SESSION_EVENT_TYPE,
      ocEvent: {
        type: RELOAD_SESSION_EVENT_TYPE as any,
        properties: {}
      }
    });
  }

  // stream locks

  private makeStreamLockKey(sessionId: string): string {
    return `stream-owner:${sessionId}`;
  }

  private async tryAcquireStreamLock(sessionId: string): Promise<boolean> {
    let result = await this.redisClient.set(
      this.makeStreamLockKey(sessionId),
      this.podId,
      'EX',
      AgentStreamService.STREAM_LOCK_TTL_SECONDS,
      'NX'
    );
    return result === 'OK';
  }

  private async refreshStreamLocks(): Promise<void> {
    for (let sessionId of this.activeStreams.keys()) {
      let result = await this.redisClient.eval(
        `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("expire", KEYS[1], ${AgentStreamService.STREAM_LOCK_TTL_SECONDS}) else return 0 end`,
        1,
        this.makeStreamLockKey(sessionId),
        this.podId
      );

      if (result === 0) {
        console.log(
          `[refreshStreamLocks] lock lost, cleaning up sessionId=${sessionId}`
        );

        let stopFn = this.activeStreams.get(sessionId);
        if (stopFn) {
          stopFn();
          this.activeStreams.delete(sessionId);
        }

        this.lastEventTsMap.delete(sessionId);
        this.agentDrainService.cleanup(sessionId);
      }
    }
  }

  private async releaseStreamLock(sessionId: string): Promise<void> {
    await this.redisClient.eval(
      `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end`,
      1,
      this.makeStreamLockKey(sessionId),
      this.podId
    );
  }

  // stream

  async startEventStream(item: {
    sessionId: string;
    opencodeSessionId: string;
  }): Promise<void> {
    if (this.activeStreams.has(item.sessionId)) {
      console.log(
        `[startEventStream] skip - already in activeStreams sessionId=${item.sessionId}`
      );
      return;
    }

    let acquired = await this.tryAcquireStreamLock(item.sessionId);
    if (!acquired) {
      console.log(
        `[startEventStream] skip - lock not acquired sessionId=${item.sessionId}`
      );
      return;
    }

    console.log(
      `[startEventStream] lock acquired, subscribing sessionId=${item.sessionId}`
    );

    let opencodeClient = await this.agentSandboxService.getOpenCodeClient({
      sessionId: item.sessionId
    });

    let abortController = new AbortController();

    let eventIndex = await this.agentDrainService.getNextEventIndex(
      item.sessionId
    );

    let response = await opencodeClient.event.subscribe(
      {},
      { signal: abortController.signal }
    );

    console.log(
      `[startEventStream] subscribed, starting refetch sessionId=${item.sessionId}`
    );

    await this.agentDrainService.refetchFromOpenCode({
      sessionId: item.sessionId,
      opencodeSessionId: item.opencodeSessionId,
      client: opencodeClient
    });

    console.log(
      `[startEventStream] refetch complete sessionId=${item.sessionId}`
    );

    let processStream = async () => {
      let streamFailed = false;

      try {
        for await (let event of response.stream) {
          this.lastEventTsMap.set(item.sessionId, Date.now());
          this.agentDrainService.enqueue({
            sessionId: item.sessionId,
            event: event,
            eventIndex: eventIndex
          });
          eventIndex++;
        }

        console.log(
          `[processStream] stream ended naturally sessionId=${item.sessionId}`
        );
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          logToConsoleBackend({
            log: new ServerError({
              message: ErEnum.BACKEND_AGENT_SSE_STREAM_FAILED,
              originalError: e
            }),
            logLevel: LogLevelEnum.Error,
            logger: this.logger,
            cs: this.cs
          });

          streamFailed = true;

          console.log(
            `[processStream] stream failed sessionId=${item.sessionId} error=${e.message}`
          );
        } else {
          console.log(
            `[processStream] stream aborted sessionId=${item.sessionId}`
          );
        }
      }

      await this.stopEventStream(item.sessionId);

      if (streamFailed) {
        await this.publishReloadSession({
          sessionId: item.sessionId,
          eventIndex: eventIndex
        });
      }
    };

    this.activeStreams.set(item.sessionId, () => abortController.abort());
    this.lastEventTsMap.set(item.sessionId, Date.now());

    processStream();
  }

  async stopEventStream(sessionId: string): Promise<void> {
    console.log('stopEventStream started');
    let stopFn = this.activeStreams.get(sessionId);

    if (stopFn) {
      stopFn();
      this.activeStreams.delete(sessionId);
    }

    this.lastEventTsMap.delete(sessionId);

    console.log('stopEventStream part 1 done');
    try {
      await this.agentDrainService.drainQueue(sessionId);
      console.log('stopEventStream part 2 done');
    } finally {
      this.agentDrainService.cleanup(sessionId);
      await this.releaseStreamLock(sessionId);
    }

    console.log('stopEventStream completed');
  }

  async respondToPermission(item: {
    sessionId: string;
    opencodeSessionId: string;
    permissionId: string;
    reply: string;
  }): Promise<void> {
    let opencodeClient = await this.agentSandboxService.getOpenCodeClient({
      sessionId: item.sessionId
    });

    await opencodeClient.permission.respond({
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
    let opencodeClient = await this.agentSandboxService.getOpenCodeClient({
      sessionId: item.sessionId
    });

    await opencodeClient.question.reply({
      requestID: item.questionId,
      answers: item.answers
    });
  }

  async rejectQuestion(item: {
    sessionId: string;
    opencodeSessionId: string;
    questionId: string;
  }): Promise<void> {
    let opencodeClient = await this.agentSandboxService.getOpenCodeClient({
      sessionId: item.sessionId
    });

    await opencodeClient.question.reject({
      requestID: item.questionId
    });
  }

  private async checkStreamStalls(): Promise<void> {
    let now = Date.now();

    for (let sessionId of this.activeStreams.keys()) {
      let lastEventTs = this.lastEventTsMap.get(sessionId);

      if (lastEventTs === undefined) {
        continue;
      }

      let elapsed = now - lastEventTs;
      let isStalled = elapsed > AgentStreamService.STREAM_STALL_THRESHOLD_MS;

      if (isStalled) {
        console.log(
          `[checkStreamStalls] stream stalled for sessionId=${sessionId} elapsed=${elapsed}ms`
        );

        let eventIndex =
          this.agentDrainService.eventCounters.get(sessionId) ?? 0;

        await this.stopEventStream(sessionId);

        await this.publishReloadSession({
          sessionId: sessionId,
          eventIndex: eventIndex
        });
      }
    }
  }

  async waitForStreamLockRelease(item: { sessionId: string }): Promise<void> {
    let key = this.makeStreamLockKey(item.sessionId);
    let startTs = Date.now();

    while (true) {
      let exists = await this.redisClient.exists(key);

      if (exists === 0) {
        return;
      }

      let elapsed = Date.now() - startTs;
      let isTimedOut =
        elapsed >= AgentStreamService.STREAM_LOCK_WAIT_TIMEOUT_MS;

      if (isTimedOut) {
        console.log(
          `[waitForStreamLockRelease] timed out after ${elapsed}ms for sessionId=${item.sessionId}`
        );
        return;
      }

      await new Promise(r => setTimeout(r, 500));
    }
  }

  onModuleDestroy() {
    clearInterval(this.drainTimer);
    this.redisSubscriber.disconnect();
    this.redisClient.disconnect();
  }
}
