import crypto from 'node:crypto';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { BackendConfig } from '#backend/config/backend-config';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ServerError } from '#common/models/server-error';
import { AgentSandboxService } from './agent-sandbox.service';
import { AgentSandboxLifecycleService } from './agent-sandbox-lifecycle.service';
import { AgentStreamDrainService } from './agent-stream-drain.service';

@Injectable()
export class AgentStreamService implements OnModuleDestroy {
  private podId = crypto.randomUUID();

  private redisClient: Redis;

  private activeStreams = new Map<string, () => void>();

  private drainTimer: ReturnType<typeof setInterval>;

  constructor(
    private cs: ConfigService<BackendConfig>,
    private agentDrainService: AgentStreamDrainService,
    private agentLifecycleService: AgentSandboxLifecycleService,
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

    this.drainTimer = setInterval(async () => {
      try {
        let safePauseSessionIds = await this.agentDrainService.drainAllQueues();

        for (let sessionId of safePauseSessionIds) {
          try {
            await this.stopEventStream(sessionId);
            await this.agentLifecycleService.pauseSessionById({ sessionId });
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
    }, 1000);
  }

  // stream locks

  private streamLockKey(sessionId: string): string {
    return `stream-owner:${sessionId}`;
  }

  private async tryAcquireStreamLock(sessionId: string): Promise<boolean> {
    let result = await this.redisClient.set(
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
      await this.redisClient.eval(
        `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("expire", KEYS[1], 10) else return 0 end`,
        1,
        this.streamLockKey(sessionId),
        this.podId
      );
    }
  }

  private async releaseStreamLock(sessionId: string): Promise<void> {
    await this.redisClient.eval(
      `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end`,
      1,
      this.streamLockKey(sessionId),
      this.podId
    );
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

    let opencodeClient = this.agentSandboxService.getOpenCodeClientCheckExists(
      item.sessionId
    );

    let abortController = new AbortController();

    let eventIndex = await this.agentDrainService.getNextEventIndex(
      item.sessionId
    );

    let response = await opencodeClient.event.subscribe(
      {},
      { signal: abortController.signal }
    );

    let processStream = async () => {
      try {
        for await (let event of response.stream) {
          this.agentDrainService.enqueue({
            sessionId: item.sessionId,
            event: event,
            eventIndex: eventIndex
          });
          eventIndex++;
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

    await this.agentDrainService.drainQueue(sessionId);
    this.agentDrainService.cleanup(sessionId);
    this.agentSandboxService.disposeOpenCodeClient(sessionId);
    await this.releaseStreamLock(sessionId);
  }

  async respondToPermission(item: {
    sessionId: string;
    opencodeSessionId: string;
    permissionId: string;
    reply: string;
  }): Promise<void> {
    let opencodeClient = this.agentSandboxService.getOpenCodeClientCheckExists(
      item.sessionId
    );

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
    let opencodeClient = this.agentSandboxService.getOpenCodeClientCheckExists(
      item.sessionId
    );

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
    let opencodeClient = this.agentSandboxService.getOpenCodeClientCheckExists(
      item.sessionId
    );

    await opencodeClient.question.reject({
      requestID: item.questionId
    });
  }

  onModuleDestroy() {
    clearInterval(this.drainTimer);
    this.redisClient.disconnect();
  }
}
