import crypto from 'node:crypto';
import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  OpencodeClient,
  PermissionRequest,
  QuestionRequest
} from '@opencode-ai/sdk/v2';
import { sql } from 'drizzle-orm';
import { Redis } from 'ioredis';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { RELOAD_SESSION_EVENT_TYPE } from '#common/constants/top';
import { CHANNEL_OPENCODE_STREAM_COMMAND } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { OpencodeStreamCommandEnum } from '#common/enums/opencode-stream-command.enum';
import { PauseReasonEnum } from '#common/enums/pause-reason.enum';
import { ServerError } from '#common/models/server-error';
import { OcMessagesService } from '../db/oc-messages.service';
import { OcPartsService } from '../db/oc-parts.service';
import { SessionsService } from '../db/sessions.service';
import { AgentDrainService } from './agent-drain.service';
import { AgentOpencodeService } from './agent-opencode.service';
import { AgentSandboxService } from './agent-sandbox.service';
import { AgentSseService } from './agent-sse.service';

@Injectable()
export class AgentStreamOpencodeService implements OnModuleDestroy {
  private podId = crypto.randomUUID();

  // OpenCode sends heartbeat every 10s (hardcoded in workspace-server/routes.ts) + 4s buffer
  private STREAM_STALL_THRESHOLD_MS = 14_000;

  private STREAM_LOCK_TTL_SECONDS = 16;
  private STREAM_LOCK_WAIT_TIMEOUT_MS = 18_000;

  private redisClient: Redis;

  private redisSubscriber: Redis;

  private activeStreams = new Map<string, () => void>();

  private lastEventTsMap = new Map<string, number>();

  constructor(
    private cs: ConfigService<BackendConfig>,
    private agentDrainService: AgentDrainService,
    private agentSseService: AgentSseService,
    private agentSandboxService: AgentSandboxService,
    private agentOpencodeService: AgentOpencodeService,
    private sessionsService: SessionsService,
    private ocMessagesService: OcMessagesService,
    private ocPartsService: OcPartsService,
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

    this.redisSubscriber = new Redis({
      host: valkeyHost,
      port: 6379,
      password: valkeyPassword
    });

    this.redisSubscriber.subscribe(CHANNEL_OPENCODE_STREAM_COMMAND);

    this.redisSubscriber.on('message', (_channel, rawMessage) => {
      try {
        let parsed = JSON.parse(rawMessage);
        let { command, sessionId } = parsed;

        if (!this.activeStreams.has(sessionId)) {
          return;
        }

        if (command === OpencodeStreamCommandEnum.Stop) {
          console.log(`[oc-stream] received stop for sessionId=${sessionId}`);

          this.stopEventStream({ sessionId: sessionId }).catch(e => {
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
      } catch (e) {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_AGENT_STOP_STREAM_PUBSUB_FAILED,
            originalError: e
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      }
    });
  }

  async publishStopSessionStream(item: {
    sessionId: string;
  }): Promise<boolean> {
    let key = this.makeStreamLockKey({ sessionId: item.sessionId });
    let exists = await this.redisClient.exists(key);

    if (exists === 0) {
      return false;
    }

    await this.redisClient.publish(
      CHANNEL_OPENCODE_STREAM_COMMAND,
      JSON.stringify({
        command: OpencodeStreamCommandEnum.Stop,
        sessionId: item.sessionId
      })
    );

    return true;
  }

  async publishReloadSession(item: { sessionId: string }): Promise<void> {
    console.log(
      `[oc-stream] publishing reload for sessionId=${item.sessionId}`
    );

    await this.agentSseService.publish({
      sessionId: item.sessionId,
      event: {
        eventId: `${item.sessionId}_0`,
        eventIndex: 0,
        eventType: RELOAD_SESSION_EVENT_TYPE,
        ocEvent: {
          type: RELOAD_SESSION_EVENT_TYPE as any,
          properties: {}
        }
      }
    });
  }

  async processSafePause(item: { sessionIds: string[] }): Promise<void> {
    for (let sessionId of item.sessionIds) {
      try {
        await this.stopEventStream({ sessionId: sessionId });
        await this.agentSandboxService.pauseSessionById({
          sessionId: sessionId,
          pauseReason: PauseReasonEnum.Safe
        });

        await this.publishReloadSession({
          sessionId: sessionId
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
  }

  // stream locks

  private makeStreamLockKey(item: { sessionId: string }): string {
    let { sessionId } = item;
    return `stream-owner:${sessionId}`;
  }

  private async tryAcquireStreamLock(item: {
    sessionId: string;
  }): Promise<boolean> {
    let { sessionId } = item;
    let result = await this.redisClient.set(
      this.makeStreamLockKey({ sessionId: sessionId }),
      this.podId,
      'EX',
      this.STREAM_LOCK_TTL_SECONDS,
      'NX'
    );
    return result === 'OK';
  }

  async refreshActiveLocks(): Promise<void> {
    for (let sessionId of this.activeStreams.keys()) {
      let result = await this.redisClient.eval(
        `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("expire", KEYS[1], ${this.STREAM_LOCK_TTL_SECONDS}) else return 0 end`,
        1,
        this.makeStreamLockKey({ sessionId: sessionId }),
        this.podId
      );

      if (result === 0) {
        console.log(
          `[oc-stream] lock lost, cleaning up sessionId=${sessionId}`
        );

        let stopFn = this.activeStreams.get(sessionId);
        if (stopFn) {
          stopFn();
          this.activeStreams.delete(sessionId);
        }

        this.lastEventTsMap.delete(sessionId);
        this.agentDrainService.cleanup({ sessionId: sessionId });
      }
    }
  }

  private async releaseStreamLock(item: { sessionId: string }): Promise<void> {
    let { sessionId } = item;
    await this.redisClient.eval(
      `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end`,
      1,
      this.makeStreamLockKey({ sessionId: sessionId }),
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
        `[oc-stream] skip - already in activeStreams sessionId=${item.sessionId}`
      );
      return;
    }

    let acquired = await this.tryAcquireStreamLock({
      sessionId: item.sessionId
    });
    if (!acquired) {
      console.log(
        `[oc-stream] skip - lock not acquired sessionId=${item.sessionId}`
      );
      return;
    }

    console.log(
      `[oc-stream] lock acquired, subscribing sessionId=${item.sessionId}`
    );

    let opencodeClient = await this.agentOpencodeService.getOpenCodeClient({
      sessionId: item.sessionId
    });

    let abortController = new AbortController();

    await this.agentDrainService.initEventCounter({
      sessionId: item.sessionId
    });

    let response = await opencodeClient.event.subscribe(
      {},
      { signal: abortController.signal }
    );

    console.log(
      `[oc-stream] subscribed, starting refetch sessionId=${item.sessionId}`
    );

    await this.refetchFromOpenCode({
      sessionId: item.sessionId,
      opencodeSessionId: item.opencodeSessionId,
      client: opencodeClient
    });

    console.log(`[oc-stream] refetch complete sessionId=${item.sessionId}`);

    let processStream = async () => {
      let streamFailed = false;

      try {
        for await (let event of response.stream) {
          this.lastEventTsMap.set(item.sessionId, Date.now());
          this.agentDrainService.enqueue({
            sessionId: item.sessionId,
            event: event
          });
        }

        console.log(
          `[oc-stream] stream ended naturally sessionId=${item.sessionId}`
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
            `[oc-stream] stream failed sessionId=${item.sessionId} error=${e.message}`
          );
        } else {
          console.log(`[oc-stream] stream aborted sessionId=${item.sessionId}`);
        }
      }

      await this.stopEventStream({ sessionId: item.sessionId });

      if (streamFailed) {
        await this.publishReloadSession({
          sessionId: item.sessionId
        });
      }
    };

    this.activeStreams.set(item.sessionId, () => abortController.abort());
    this.lastEventTsMap.set(item.sessionId, Date.now());

    processStream();
  }

  async stopEventStream(item: { sessionId: string }): Promise<void> {
    let { sessionId } = item;
    console.log('[oc-stream] stopEventStream started');
    let stopFn = this.activeStreams.get(sessionId);

    if (stopFn) {
      stopFn();
      this.activeStreams.delete(sessionId);
    }

    this.lastEventTsMap.delete(sessionId);

    try {
      await this.agentDrainService.drainQueue({ sessionId: sessionId });
    } finally {
      this.agentDrainService.cleanup({ sessionId: sessionId });
      await this.releaseStreamLock({ sessionId: sessionId });
    }

    console.log('[oc-stream] stopEventStream completed');
  }

  async respondToPermission(item: {
    sessionId: string;
    opencodeSessionId: string;
    permissionId: string;
    reply: string;
  }): Promise<void> {
    let opencodeClient = await this.agentOpencodeService.getOpenCodeClient({
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
    let opencodeClient = await this.agentOpencodeService.getOpenCodeClient({
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
    let opencodeClient = await this.agentOpencodeService.getOpenCodeClient({
      sessionId: item.sessionId
    });

    await opencodeClient.question.reject({
      requestID: item.questionId
    });
  }

  async checkStreamStalls(): Promise<void> {
    let now = Date.now();

    for (let sessionId of this.activeStreams.keys()) {
      let lastEventTs = this.lastEventTsMap.get(sessionId);

      if (lastEventTs === undefined) {
        continue;
      }

      let elapsed = now - lastEventTs;
      let isStalled = elapsed > this.STREAM_STALL_THRESHOLD_MS;

      if (isStalled) {
        console.log(
          `[oc-stream] stream stalled for sessionId=${sessionId} elapsed=${elapsed}ms`
        );

        await this.stopEventStream({ sessionId: sessionId });

        await this.publishReloadSession({
          sessionId: sessionId
        });
      }
    }
  }

  async waitForStreamLockRelease(item: { sessionId: string }): Promise<void> {
    let key = this.makeStreamLockKey({ sessionId: item.sessionId });
    let startTs = Date.now();

    while (true) {
      let exists = await this.redisClient.exists(key);

      if (exists === 0) {
        return;
      }

      let elapsed = Date.now() - startTs;
      let isTimedOut = elapsed >= this.STREAM_LOCK_WAIT_TIMEOUT_MS;

      if (isTimedOut) {
        console.log(
          `[oc-stream] timed out after ${elapsed}ms for sessionId=${item.sessionId}`
        );
        return;
      }

      await new Promise(r => setTimeout(r, 500));
    }
  }

  async refetchFromOpenCode(item: {
    sessionId: string;
    opencodeSessionId: string;
    client: OpencodeClient;
  }): Promise<void> {
    try {
      let [
        messagesResp,
        sessionResp,
        todoResp,
        statusResp,
        questionsResp,
        permissionsResp
      ] = await Promise.all([
        item.client.session.messages({
          sessionID: item.opencodeSessionId
        }),
        item.client.session.get({ sessionID: item.opencodeSessionId }),
        item.client.session.todo({ sessionID: item.opencodeSessionId }),
        item.client.session.status(),
        item.client.question.list(),
        item.client.permission.list()
      ]);

      let messageTabs = (messagesResp.data ?? []).map(m =>
        this.ocMessagesService.makeOcMessage({
          messageId: m.info.id,
          sessionId: item.sessionId,
          role: m.info.role,
          ocMessage: m.info
        })
      );

      let partTabs = (messagesResp.data ?? []).flatMap(m =>
        m.parts.map(p =>
          this.ocPartsService.makeOcPart({
            partId: p.id as string,
            messageId: m.info.id,
            sessionId: item.sessionId,
            ocPart: p
          })
        )
      );

      let ocSessionTab = await this.sessionsService.getOcSessionBySessionId({
        sessionId: item.sessionId
      });

      if (!ocSessionTab) {
        ocSessionTab = this.sessionsService.makeOcSession({
          sessionId: item.sessionId
        });
      }

      let questions = (questionsResp.data ?? []).filter(
        (q): q is QuestionRequest =>
          !!q?.id && q.sessionID === item.opencodeSessionId
      );

      let permissions = (permissionsResp.data ?? []).filter(
        (p): p is PermissionRequest =>
          !!p?.id && p.sessionID === item.opencodeSessionId
      );

      ocSessionTab = {
        ...ocSessionTab,
        openSession: sessionResp.data,
        todos: todoResp.data ?? [],
        questions: questions,
        permissions: permissions
      };

      if (statusResp.data) {
        let ocSessionStatus =
          statusResp.data[item.opencodeSessionId] ??
          Object.values(statusResp.data)[0];
        if (ocSessionStatus) {
          ocSessionTab = { ...ocSessionTab, ocSessionStatus };
        }
      }

      await this.db.drizzle.transaction(async tx => {
        await this.db.packer.write({
          tx: tx,
          insertOrUpdate: {
            ocMessages: messageTabs,
            ocParts: partTabs,
            ocSessions: [ocSessionTab]
          }
        });

        await tx.execute(
          sql`UPDATE sessions SET last_activity_ts = ${Date.now()} WHERE session_id = ${item.sessionId}`
        );
      });
    } catch (e) {
      logToConsoleBackend({
        log: new ServerError({
          message: ErEnum.BACKEND_AGENT_REFETCH_FROM_OPENCODE_FAILED,
          originalError: e
        }),
        logLevel: LogLevelEnum.Error,
        logger: this.logger,
        cs: this.cs
      });
    }
  }

  onModuleDestroy() {
    this.redisSubscriber.disconnect();
    this.redisClient.disconnect();
  }
}
