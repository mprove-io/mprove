import crypto from 'node:crypto';
import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  AssistantMessage,
  OpencodeClient,
  PermissionRequest,
  QuestionRequest,
  SessionPromptAsyncData
} from '@opencode-ai/sdk/v2';
import { and, eq, lt, max, sql } from 'drizzle-orm';
import { Redis } from 'ioredis';
import pIteration from 'p-iteration';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import { ocEventsTable } from '#backend/drizzle/postgres/schema/oc-events.js';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import {
  CHANNEL_OPENCODE_FETCH_REPLY,
  CHANNEL_OPENCODE_INTERACT_REPLY,
  CHANNEL_OPENCODE_STREAM_COMMAND,
  KEY_OPENCODE_STREAM_OWNER
} from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { InteractionTypeEnum } from '#common/enums/interaction-type.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { OpencodeStreamCommandEnum } from '#common/enums/opencode-stream-command.enum';
import { PauseReasonEnum } from '#common/enums/pause-reason.enum';
import { isDefined } from '#common/functions/is-defined';
import { splitModel } from '#common/functions/split-model';
import { ServerError } from '#common/models/server-error';
import { OcMessagesService } from '../db/oc-messages.service';
import { OcPartsService } from '../db/oc-parts.service';
import { SessionsService } from '../db/sessions.service';
import { SessionDrainService } from '../session/session-drain.service';
import { EditorOpencodeService } from './editor-opencode.service';
import { EditorSandboxService } from './editor-sandbox.service';

const { forEachSeries } = pIteration;

@Injectable()
export class EditorStreamService implements OnModuleDestroy {
  private podId = crypto.randomUUID();

  // OpenCode sends heartbeat every 10s (hardcoded in workspace-server/routes.ts) + 4s buffer
  private STREAM_STALL_THRESHOLD_MS = 14_000;

  private STREAM_LOCK_TTL_SECONDS = 16;
  private STREAM_LOCK_WAIT_TIMEOUT_MS = 18_000;

  private redisClient: Redis;

  private redisSubscriber: Redis;

  private activeStreams = new Map<string, () => void>();

  private pendingStreamData = new Map<
    string,
    {
      response: Awaited<ReturnType<OpencodeClient['event']['subscribe']>>;
    }
  >();

  private lastEventTsMap = new Map<string, number>();

  constructor(
    private cs: ConfigService<BackendConfig>,
    private sessionDrainService: SessionDrainService,
    private editorSandboxService: EditorSandboxService,
    private editorOpencodeService: EditorOpencodeService,
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
                message: ErEnum.BACKEND_STOP_STREAM_PUBSUB_FAILED,
                originalError: e
              }),
              logLevel: LogLevelEnum.Error,
              logger: this.logger,
              cs: this.cs
            });
          });
        } else if (command === OpencodeStreamCommandEnum.Interact) {
          let { replyTo, payload } = parsed;

          console.log(
            `[oc-stream] received interact for sessionId=${sessionId}`
          );

          this.executeInteraction({
            sessionId: sessionId,
            opencodeSessionId: payload.opencodeSessionId,
            interactionType: payload.interactionType,
            message: payload.message,
            agent: payload.agent,
            model: payload.model,
            variant: payload.variant,
            permissionId: payload.permissionId,
            reply: payload.reply,
            questionId: payload.questionId,
            answers: payload.answers,
            messageId: payload.messageId,
            partId: payload.partId
          })
            .then(result => {
              this.redisClient
                .publish(replyTo, JSON.stringify(result))
                .catch(() => {});
            })
            .catch(e => {
              this.redisClient
                .publish(
                  replyTo,
                  JSON.stringify({
                    success: false,
                    error: e?.message ?? 'interact failed'
                  })
                )
                .catch(() => {});
            });
        } else if (command === OpencodeStreamCommandEnum.Fetch) {
          let { replyTo, payload } = parsed;

          console.log(
            `[oc-stream] command - fetchSessionStateFromOpencode for sessionId=${sessionId}`
          );

          this.fetchSessionStateFromOpencode({
            sessionId: sessionId,
            opencodeSessionId: payload.opencodeSessionId,
            isSetReload: true
          })
            .then(() => {
              this.redisClient
                .publish(replyTo, JSON.stringify({ success: true }))
                .catch(() => {});
            })
            .catch(e => {
              this.redisClient
                .publish(
                  replyTo,
                  JSON.stringify({
                    success: false,
                    error: e?.message ?? 'fetch failed'
                  })
                )
                .catch(() => {});
            });
        }
      } catch (e) {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_STOP_STREAM_PUBSUB_FAILED,
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
    let key = `${KEY_OPENCODE_STREAM_OWNER}:${item.sessionId}`;
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

  async setSessionRequestedReloadTs(item: {
    sessionId: string;
  }): Promise<void> {
    try {
      console.log(
        `[oc-stream] setSessionRequestedReloadTs for sessionId=${item.sessionId}`
      );

      await this.db.drizzle.execute(
        sql`UPDATE sessions SET reload_requested_ts = ${Date.now()} WHERE session_id = ${item.sessionId}`
      );
    } catch (e) {
      logToConsoleBackend({
        log: new ServerError({
          message: ErEnum.BACKEND_SCHEDULER_PUBLISH_RELOAD_SESSION_FAILED,
          originalError: e
        }),
        logLevel: LogLevelEnum.Error,
        logger: this.logger,
        cs: this.cs
      });
    }
  }

  async processSafePause(item: { sessionIds: string[] }): Promise<void> {
    let { sessionIds } = item;

    await forEachSeries(sessionIds, async (sessionId: string) => {
      try {
        await this.stopEventStream({ sessionId: sessionId });

        await this.editorSandboxService.pauseSessionById({
          sessionId: sessionId,
          pauseReason: PauseReasonEnum.Safe
        });

        await this.setSessionRequestedReloadTs({
          sessionId: sessionId
        });
      } catch (e) {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_SAFE_PAUSE_SESSION_FAILED,
            originalError: e
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      }
    });
  }

  // stream locks

  private async tryAcquireStreamLock(item: {
    sessionId: string;
  }): Promise<boolean> {
    let { sessionId } = item;
    let result = await this.redisClient.set(
      `${KEY_OPENCODE_STREAM_OWNER}:${sessionId}`,
      this.podId,
      'EX',
      this.STREAM_LOCK_TTL_SECONDS,
      'NX'
    );
    return result === 'OK';
  }

  async refreshActiveLocks(): Promise<void> {
    let activeStreamSessionIds = [...this.activeStreams.keys()];

    await forEachSeries(activeStreamSessionIds, async (sessionId: string) => {
      let result = await this.redisClient.eval(
        `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("expire", KEYS[1], ${this.STREAM_LOCK_TTL_SECONDS}) else return 0 end`,
        1,
        `${KEY_OPENCODE_STREAM_OWNER}:${sessionId}`,
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
        this.sessionDrainService.cleanup({ sessionId: sessionId });
      }
    });
  }

  private async releaseStreamLock(item: { sessionId: string }): Promise<void> {
    let { sessionId } = item;

    await this.redisClient.eval(
      `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end`,
      1,
      `${KEY_OPENCODE_STREAM_OWNER}:${sessionId}`,
      this.podId
    );
  }

  // stream

  async startEventStream(item: {
    sessionId: string;
    opencodeSessionId: string;
    isSetReload: boolean;
  }): Promise<boolean> {
    let { isSetReload } = item;

    if (this.activeStreams.has(item.sessionId)) {
      console.log(
        `[oc-stream] skip startEventStream - already in activeStreams sessionId=${item.sessionId}`
      );
      return false;
    }

    let acquired = await this.tryAcquireStreamLock({
      sessionId: item.sessionId
    });

    if (!acquired) {
      console.log(
        `[oc-stream] skip startEventStream - lock not acquired sessionId=${item.sessionId}`
      );
      return false;
    }

    console.log(
      `[oc-stream] startEventStream - lock acquired, subscribing sessionId=${item.sessionId}`
    );

    let opencodeClient = await this.editorOpencodeService.getOpenCodeClient({
      sessionId: item.sessionId
    });

    let abortController = new AbortController();

    await this.sessionDrainService.initEventCounter({
      sessionId: item.sessionId
    });

    let response = await opencodeClient.event.subscribe(
      {},
      { signal: abortController.signal }
    );

    console.log(
      `[oc-stream] startEventStream - subscribed sessionId=${item.sessionId}`
    );

    this.activeStreams.set(item.sessionId, () => abortController.abort());
    this.lastEventTsMap.set(item.sessionId, Date.now());
    this.pendingStreamData.set(item.sessionId, {
      response: response
    });

    console.log(
      `[oc-stream] startEventStream - fetchSessionStateFromOpencode for sessionId=${item.sessionId}`
    );

    await this.fetchSessionStateFromOpencode({
      sessionId: item.sessionId,
      opencodeSessionId: item.opencodeSessionId,
      isSetReload: isSetReload
    });

    return true;
  }

  async processEventStream(item: { sessionId: string }): Promise<void> {
    let pending = this.pendingStreamData.get(item.sessionId);
    if (!pending) {
      return;
    }

    this.pendingStreamData.delete(item.sessionId);

    let { response } = pending;

    let processStream = async () => {
      try {
        for await (let event of response.stream) {
          this.lastEventTsMap.set(item.sessionId, Date.now());

          this.sessionDrainService.enqueue({
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
              message: ErEnum.BACKEND_SSE_STREAM_FAILED,
              originalError: e
            }),
            logLevel: LogLevelEnum.Error,
            logger: this.logger,
            cs: this.cs
          });

          console.log(
            `[oc-stream] stream failed sessionId=${item.sessionId} error=${e.message}`
          );
        } else {
          console.log(`[oc-stream] stream aborted sessionId=${item.sessionId}`);
        }
      }

      await this.stopEventStream({ sessionId: item.sessionId });

      await this.setSessionRequestedReloadTs({
        sessionId: item.sessionId
      });
    };

    console.log(
      `[oc-stream] processEventStream started sessionId=${item.sessionId}`
    );

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
    this.sessionDrainService.cleanup({ sessionId: sessionId });
    await this.releaseStreamLock({ sessionId: sessionId });

    console.log('[oc-stream] stopEventStream completed');
  }

  async respondToPermission(item: {
    sessionId: string;
    opencodeSessionId: string;
    permissionId: string;
    reply: string;
  }): Promise<void> {
    let opencodeClient = await this.editorOpencodeService.getOpenCodeClient({
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
    let opencodeClient = await this.editorOpencodeService.getOpenCodeClient({
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
    let opencodeClient = await this.editorOpencodeService.getOpenCodeClient({
      sessionId: item.sessionId
    });

    await opencodeClient.question.reject({
      requestID: item.questionId
    });
  }

  async checkStreamStalls(): Promise<void> {
    let now = Date.now();

    let activeSessionIds = [...this.activeStreams.keys()];

    activeSessionIds.forEach(async sessionId => {
      let lastEventTs = this.lastEventTsMap.get(sessionId);

      if (lastEventTs === undefined) {
        return;
      }

      let elapsed = now - lastEventTs;

      let isStalled = elapsed > this.STREAM_STALL_THRESHOLD_MS;

      if (isStalled) {
        console.log(
          `[oc-stream] stream stalled for sessionId=${sessionId} elapsed=${elapsed}ms`
        );

        await this.stopEventStream({ sessionId: sessionId });

        await this.setSessionRequestedReloadTs({
          sessionId: sessionId
        });
      }
    });
  }

  async waitForStreamLockRelease(item: { sessionId: string }): Promise<void> {
    let key = `${KEY_OPENCODE_STREAM_OWNER}:${item.sessionId}`;
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

  async fetchSessionStateFromOpencode(item: {
    sessionId: string;
    opencodeSessionId: string;
    isSetReload: boolean;
  }): Promise<void> {
    let { isSetReload } = item;

    try {
      let maxEventIndexRow = await this.db.drizzle
        .select({ maxIndex: max(ocEventsTable.eventIndex) })
        .from(ocEventsTable)
        .where(eq(ocEventsTable.sessionId, item.sessionId));

      let lastFetchEventIndex = isDefined(maxEventIndexRow[0]?.maxIndex)
        ? maxEventIndexRow[0].maxIndex
        : -1;

      let client = await this.editorOpencodeService.getOpenCodeClient({
        sessionId: item.sessionId
      });

      let [
        messagesResp,
        sessionResp,
        todoResp,
        statusResp,
        questionsResp,
        permissionsResp
      ] = await Promise.all([
        client.session.messages({
          sessionID: item.opencodeSessionId
        }),
        client.session.get({ sessionID: item.opencodeSessionId }),
        client.session.todo({ sessionID: item.opencodeSessionId }),
        client.session.status(),
        client.question.list(),
        client.permission.list()
      ]);

      let messages = messagesResp.data ?? [];

      let lastActivityTs: number | undefined;

      messages.forEach(m => {
        let created = m.info.time.created;

        if (lastActivityTs === undefined || created > lastActivityTs) {
          lastActivityTs = created;
        }

        let isAssistant = m.info.role === 'assistant';

        if (isAssistant) {
          let completed = (m.info as AssistantMessage).time.completed;

          if (
            isDefined(completed) &&
            (lastActivityTs === undefined || completed > lastActivityTs)
          ) {
            lastActivityTs = completed;
          }
        }
      });

      let messageTabs = messages.map(m =>
        this.ocMessagesService.makeOcMessage({
          messageId: m.info.id,
          sessionId: item.sessionId,
          role: m.info.role,
          ocMessage: m.info
        })
      );

      let partTabs = messages.flatMap(m =>
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

        if (isDefined(lastActivityTs)) {
          await tx.execute(
            sql`UPDATE sessions SET last_fetch_event_index = ${lastFetchEventIndex}, last_activity_ts = GREATEST(last_activity_ts, ${lastActivityTs}) WHERE session_id = ${item.sessionId}`
          );
        } else {
          await tx.execute(
            sql`UPDATE sessions SET last_fetch_event_index = ${lastFetchEventIndex} WHERE session_id = ${item.sessionId}`
          );
        }

        let oneHourAgo = Date.now() - 60 * 60 * 1000;

        await tx
          .delete(ocEventsTable)
          .where(
            and(
              eq(ocEventsTable.sessionId, item.sessionId),
              lt(ocEventsTable.serverTs, oneHourAgo)
            )
          );
      });

      if (isSetReload === true) {
        await this.setSessionRequestedReloadTs({ sessionId: item.sessionId });
      }
    } catch (e) {
      logToConsoleBackend({
        log: new ServerError({
          message: ErEnum.BACKEND_REFETCH_FROM_OPENCODE_FAILED,
          originalError: e
        }),
        logLevel: LogLevelEnum.Error,
        logger: this.logger,
        cs: this.cs
      });
    }
  }

  async executeInteraction(item: {
    sessionId: string;
    opencodeSessionId: string;
    interactionType: InteractionTypeEnum;
    message?: string;
    agent?: string;
    model?: string;
    variant?: string;
    permissionId?: string;
    reply?: string;
    questionId?: string;
    answers?: string[][];
    messageId?: string;
    partId?: string;
  }): Promise<{ success: boolean }> {
    let opencodeClient = await this.editorOpencodeService.getOpenCodeClient({
      sessionId: item.sessionId
    });

    if (item.interactionType === InteractionTypeEnum.Message) {
      let promptBody: NonNullable<SessionPromptAsyncData['body']> = {
        parts: [
          {
            type: 'text',
            text: item.message,
            ...(item.partId ? { id: item.partId } : {})
          }
        ]
      };

      if (item.agent) {
        promptBody.agent = item.agent;
      }

      let split = splitModel(item.model);

      if (split) {
        promptBody.model = split;
      }

      if (item.variant) {
        promptBody.variant = item.variant;
      }

      if (item.messageId) {
        promptBody.messageID = item.messageId;
      }

      await opencodeClient.session.promptAsync(
        {
          sessionID: item.opencodeSessionId,
          ...promptBody
        },
        { throwOnError: true }
      );

      // fix for missing user message part in returned opencode state, if it was sent to paused session
      if (item.messageId && item.partId) {
        try {
          let modelSplit = split || {
            providerID: '',
            modelID: item.model || ''
          };

          let userMessageTab = this.ocMessagesService.makeOcMessage({
            messageId: item.messageId,
            sessionId: item.sessionId,
            role: 'user',
            ocMessage: {
              id: item.messageId,
              sessionID: item.opencodeSessionId,
              role: 'user',
              variant: item.variant,
              time: { created: Date.now() },
              agent: item.agent,
              model: modelSplit
            } as any
          });

          let userPartTab = this.ocPartsService.makeOcPart({
            partId: item.partId,
            messageId: item.messageId,
            sessionId: item.sessionId,
            ocPart: {
              id: item.partId,
              sessionID: item.opencodeSessionId,
              messageID: item.messageId,
              type: 'text',
              text: item.message
            } as any
          });

          await this.db.drizzle.transaction(async tx => {
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                ocMessages: [userMessageTab],
                ocParts: [userPartTab]
              }
            });
          });
        } catch (e: any) {
          console.log(
            `[oc-exec] failed to persist user message part sessionId=${item.sessionId} messageId=${item.messageId}: ${e?.message}`
          );
        }
      }
    } else if (item.interactionType === InteractionTypeEnum.Permission) {
      await this.respondToPermission({
        sessionId: item.sessionId,
        opencodeSessionId: item.opencodeSessionId,
        permissionId: item.permissionId,
        reply: item.reply
      });
    } else if (item.interactionType === InteractionTypeEnum.Question) {
      if (item.answers !== undefined) {
        await this.respondToQuestion({
          sessionId: item.sessionId,
          opencodeSessionId: item.opencodeSessionId,
          questionId: item.questionId,
          answers: item.answers
        });
      } else {
        await this.rejectQuestion({
          sessionId: item.sessionId,
          opencodeSessionId: item.opencodeSessionId,
          questionId: item.questionId
        });
      }
    } else if (item.interactionType === InteractionTypeEnum.Stop) {
      await opencodeClient.session.abort(
        {
          sessionID: item.opencodeSessionId
        },
        { throwOnError: true }
      );
    }

    return { success: true };
  }

  async publishInteractCommand(item: {
    sessionId: string;
    opencodeSessionId: string;
    interactionType: InteractionTypeEnum;
    message?: string;
    agent?: string;
    model?: string;
    variant?: string;
    permissionId?: string;
    reply?: string;
    questionId?: string;
    answers?: string[][];
    messageId?: string;
    partId?: string;
  }): Promise<{ success: boolean }> {
    let correlationId = crypto.randomUUID();
    let replyTo = `${CHANNEL_OPENCODE_INTERACT_REPLY}:${correlationId}`;

    let sub = this.redisClient.duplicate();

    await sub.subscribe(replyTo);

    await this.redisClient.publish(
      CHANNEL_OPENCODE_STREAM_COMMAND,
      JSON.stringify({
        command: OpencodeStreamCommandEnum.Interact,
        sessionId: item.sessionId,
        replyTo: replyTo,
        payload: {
          opencodeSessionId: item.opencodeSessionId,
          interactionType: item.interactionType,
          message: item.message,
          agent: item.agent,
          model: item.model,
          variant: item.variant,
          permissionId: item.permissionId,
          reply: item.reply,
          questionId: item.questionId,
          answers: item.answers,
          messageId: item.messageId,
          partId: item.partId
        }
      })
    );

    let timeoutMs = 30_000;

    return new Promise<{ success: boolean }>((resolve, reject) => {
      let timer = setTimeout(() => {
        sub.quit();
        reject(
          new ServerError({
            message: ErEnum.BACKEND_INTERACT_TIMEOUT,
            customData: { sessionId: item.sessionId, timeoutMs: timeoutMs }
          })
        );
      }, timeoutMs);

      sub.on('message', (_channel, rawMessage) => {
        clearTimeout(timer);
        sub.quit();

        try {
          let result = JSON.parse(rawMessage);

          if (result.success) {
            resolve(result);
          } else {
            reject(
              new ServerError({
                message: ErEnum.BACKEND_INTERACT_FAILED,
                customData: {
                  sessionId: item.sessionId,
                  error: result.error
                }
              })
            );
          }
        } catch {
          reject(
            new ServerError({
              message: ErEnum.BACKEND_INTERACT_FAILED,
              customData: { sessionId: item.sessionId }
            })
          );
        }
      });
    });
  }

  async publishFetchFromOpencodeCommand(item: {
    sessionId: string;
    opencodeSessionId: string;
  }): Promise<void> {
    let correlationId = crypto.randomUUID();
    let replyTo = `${CHANNEL_OPENCODE_FETCH_REPLY}:${correlationId}`;

    let sub = this.redisClient.duplicate();

    try {
      await sub.subscribe(replyTo);

      await this.redisClient.publish(
        CHANNEL_OPENCODE_STREAM_COMMAND,
        JSON.stringify({
          command: OpencodeStreamCommandEnum.Fetch,
          sessionId: item.sessionId,
          replyTo: replyTo,
          payload: {
            opencodeSessionId: item.opencodeSessionId
          }
        })
      );

      let timeoutMs = 15_000;

      await new Promise<void>((resolve, reject) => {
        let timer = setTimeout(() => {
          sub.quit();
          reject(
            new ServerError({
              message: ErEnum.BACKEND_FETCH_TIMEOUT,
              customData: {
                sessionId: item.sessionId,
                timeoutMs: timeoutMs
              }
            })
          );
        }, timeoutMs);

        sub.on('message', (_channel, rawMessage) => {
          clearTimeout(timer);
          sub.quit();

          try {
            let result = JSON.parse(rawMessage);

            if (result.success) {
              resolve();
            } else {
              reject(
                new ServerError({
                  message: ErEnum.BACKEND_FETCH_FAILED,
                  customData: {
                    sessionId: item.sessionId,
                    error: result.error
                  }
                })
              );
            }
          } catch {
            reject(
              new ServerError({
                message: ErEnum.BACKEND_FETCH_FAILED,
                customData: { sessionId: item.sessionId }
              })
            );
          }
        });
      });
    } catch (e) {
      logToConsoleBackend({
        log:
          e instanceof ServerError
            ? e
            : new ServerError({
                message: ErEnum.BACKEND_FETCH_FAILED,
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
