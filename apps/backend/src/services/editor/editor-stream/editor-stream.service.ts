import crypto from 'node:crypto';
import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  AssistantMessage,
  OpencodeClient,
  PermissionRequest,
  QuestionRequest,
  SessionPromptAsyncData,
  TextPart,
  UserMessage
} from '@opencode-ai/sdk/v2';
import { Result } from '@praha/byethrow';
import { and, eq, lt, max, sql } from 'drizzle-orm';
import { Redis } from 'ioredis';
import pIteration from 'p-iteration';
import { BackendConfig } from '#backend/config/backend-config';
import type {
  OcMessageTab,
  OcPartTab,
  OcSessionTab,
  SessionTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { ocEventsTable } from '#backend/drizzle/postgres/schema/oc-events';
import { ocSessionsTable } from '#backend/drizzle/postgres/schema/oc-sessions';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { DbService } from '#backend/services/db/db.service';
import { OcMessagesService } from '#backend/services/db/oc-messages/oc-messages.service';
import { OcPartsService } from '#backend/services/db/oc-parts/oc-parts.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import {
  EditorOpencodeService,
  OPENCODE_PROJECT_OPENAI_PROVIDER_ID
} from '#backend/services/editor/editor-opencode/editor-opencode.service';
import { EditorSandboxService } from '#backend/services/editor/editor-sandbox/editor-sandbox.service';
import { EditorSessionLockService } from '#backend/services/editor/editor-session-lock/editor-session-lock.service';
import { SessionDrainService } from '#backend/services/session/session-drain/session-drain.service';
import type { EditorPermissionReply } from '#backend/types/editor-permission-reply';
import type { InteractCommandReply } from '#backend/types/interact-command-reply';
import { ServerError } from '#common/classes/server-error/server-error';
import {
  CODEX_PROVIDER_ID,
  OPENAI_PROVIDER_ID
} from '#common/constants/providers';
import {
  CHANNEL_OPENCODE_FETCH_REPLY,
  CHANNEL_OPENCODE_INTERACT_REPLY,
  CHANNEL_OPENCODE_STREAM_COMMAND,
  KEY_OPENCODE_STREAM_OWNER
} from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { AcquireSessionLockError } from '#common/types/backend/function-errors/acquire-session-lock-error';
import type { DbOcSessionsFindFirstError } from '#common/types/backend/function-errors/db/oc-sessions/db-oc-sessions-find-first-error';
import type { ExecuteInteractionError } from '#common/types/backend/function-errors/execute-interaction-error';
import type { GetOpenCodeClientError } from '#common/types/backend/function-errors/get-open-code-client-error';
import type { PauseSessionByIdError } from '#common/types/backend/function-errors/pause-session-by-id-error';
import type { PublishInteractCommandError } from '#common/types/backend/function-errors/publish-interact-command-error';
import type { RejectQuestionError } from '#common/types/backend/function-errors/reject-question-error';
import type { RespondToPermissionError } from '#common/types/backend/function-errors/respond-to-permission-error';
import type { RespondToQuestionError } from '#common/types/backend/function-errors/respond-to-question-error';
import type { StartEventStreamError } from '#common/types/backend/function-errors/start-event-stream-error';
import type { InteractionType } from '#common/types/backend/parts/session/interaction-type';
import type { OpencodeStreamCommand } from '#common/types/backend/parts/session/opencode-stream-command';

const { forEachSeries } = pIteration;

export type ExecuteInteractionOutput = { success: boolean };

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
    private editorSessionLockService: EditorSessionLockService,
    private editorOpencodeService: EditorOpencodeService,
    private sessionsService: SessionsService,
    private ocMessagesService: OcMessagesService,
    private ocPartsService: OcPartsService,
    private logger: Logger,
    private db: DbService
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

        if (command === ('stop' satisfies OpencodeStreamCommand)) {
          // console.log(`[oc-stream] received stop for sessionId=${sessionId}`);

          this.stopEventStream({ sessionId: sessionId }).catch(e => {
            logToConsoleBackend({
              log: new ServerError({
                message: 'BACKEND_STOP_STREAM_PUBSUB_FAILED',
                originalError: e
              }),
              logLevel: 'Error',
              logger: this.logger,
              cs: this.cs
            });
          });
        } else if (command === ('interact' satisfies OpencodeStreamCommand)) {
          let { replyTo, payload } = parsed;

          // console.log(
          //   `[oc-stream] received interact for sessionId=${sessionId}`
          // );

          void this.executeInteraction({
            sessionId: sessionId,
            opencodeSessionId: payload.opencodeSessionId,
            interactionType: payload.interactionType,
            message: payload.message,
            agent: payload.agent,
            providerId: payload.providerId,
            modelId: payload.modelId,
            variant: payload.variant,
            permissionId: payload.permissionId,
            reply: payload.reply,
            questionId: payload.questionId,
            answers: payload.answers,
            messageId: payload.messageId,
            partId: payload.partId,
            system: payload.system
          })
            .then(result => {
              let reply: InteractCommandReply = Result.isFailure(result)
                ? { success: false, error: result.error.code }
                : result.value;

              void this.redisClient
                .publish(replyTo, JSON.stringify(reply))
                .catch(() => {});
            })
            .catch(e => {
              void this.redisClient
                .publish(
                  replyTo,
                  JSON.stringify({
                    success: false,
                    error: e?.message ?? 'interact failed'
                  })
                )
                .catch(() => {});
            });
        } else if (command === ('fetch' satisfies OpencodeStreamCommand)) {
          let { replyTo, payload } = parsed;

          // console.log(
          //   `[oc-stream] command - fetchSessionStateFromOpencode for sessionId=${sessionId}`
          // );

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
            message: 'BACKEND_STOP_STREAM_PUBSUB_FAILED',
            originalError: e
          }),
          logLevel: 'Error',
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
        command: 'stop' satisfies OpencodeStreamCommand,
        sessionId: item.sessionId
      })
    );

    return true;
  }

  async setSessionRequestedReloadTs(item: {
    sessionId: string;
  }): Promise<void> {
    try {
      // console.log(
      //   `[oc-stream] setSessionRequestedReloadTs for sessionId=${item.sessionId}`
      // );

      await this.db.drizzle.execute(
        sql`UPDATE sessions SET reload_requested_ts = ${Date.now()} WHERE session_id = ${item.sessionId}`
      );
    } catch (e) {
      logToConsoleBackend({
        log: new ServerError({
          message: 'BACKEND_SCHEDULER_PUBLISH_RELOAD_SESSION_FAILED',
          originalError: e
        }),
        logLevel: 'Error',
        logger: this.logger,
        cs: this.cs
      });
    }
  }

  async processSafePause(item: { sessionIds: string[] }): Promise<void> {
    let { sessionIds } = item;

    await forEachSeries(sessionIds, async (sessionId: string) => {
      try {
        let sessionLockResult: Result.Result<string, AcquireSessionLockError> =
          await this.editorSessionLockService.acquireSessionLock({
            sessionId: sessionId
          });

        if (Result.isFailure(sessionLockResult)) {
          throw new ServerError({ message: sessionLockResult.error.code });
        }

        let sessionLockToken: string = sessionLockResult.value;

        try {
          let session: SessionTab =
            await this.db.sessions.findFirstCheckExistsUnwrap({
              where: eq(sessionsTable.sessionId, sessionId)
            });

          let clientResult: Result.Result<
            OpencodeClient,
            GetOpenCodeClientError
          > = await this.editorOpencodeService.getOpenCodeClient({
            sessionId: sessionId
          });

          if (Result.isFailure(clientResult)) {
            throw new ServerError({ message: clientResult.error.code });
          }

          let client: OpencodeClient = clientResult.value;

          let statusResp: Awaited<
            ReturnType<OpencodeClient['session']['status']>
          > = await client.session.status();

          let status = statusResp.data?.[session.opencodeSessionId];

          let isIdle = status?.type === 'idle';

          if (isIdle !== true) {
            return;
          }

          await this.stopEventStream({ sessionId: sessionId });

          let pauseSession: Result.Result<void, PauseSessionByIdError> =
            await this.editorSandboxService.pauseSessionById({
              sessionId: sessionId,
              pauseReason: 'Safe'
            });

          if (Result.isFailure(pauseSession)) {
            throw new ServerError({ message: pauseSession.error.code });
          }

          await this.setSessionRequestedReloadTs({
            sessionId: sessionId
          });
        } finally {
          await this.editorSessionLockService.releaseSessionLock({
            sessionId: sessionId,
            token: sessionLockToken
          });
        }
      } catch (e) {
        logToConsoleBackend({
          log: new ServerError({
            message: 'BACKEND_SAFE_PAUSE_SESSION_FAILED',
            originalError: e
          }),
          logLevel: 'Error',
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
        // console.log(
        //   `[oc-stream] lock lost, cleaning up sessionId=${sessionId}`
        // );

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
  }): Result.ResultAsync<boolean, StartEventStreamError> {
    let { sessionId, opencodeSessionId, isSetReload } = item;

    if (this.activeStreams.has(sessionId)) {
      // console.log(
      //   `[oc-stream] skip startEventStream - already in activeStreams sessionId=${item.sessionId}`
      // );
      return Result.succeed(false);
    }

    let isAcquired: boolean = await this.tryAcquireStreamLock({
      sessionId: sessionId
    });

    if (isAcquired === false) {
      // console.log(
      //   `[oc-stream] skip startEventStream - lock not acquired sessionId=${item.sessionId}`
      // );
      return Result.succeed(false);
    }

    // console.log(
    //   `[oc-stream] startEventStream - lock acquired, subscribing sessionId=${item.sessionId}`
    // );

    let clientResult: Result.Result<OpencodeClient, GetOpenCodeClientError> =
      await this.editorOpencodeService.getOpenCodeClient({
        sessionId: sessionId
      });

    if (Result.isFailure(clientResult)) {
      return clientResult;
    }

    let opencodeClient: OpencodeClient = clientResult.value;

    let abortController = new AbortController();

    await this.sessionDrainService.initEventCounter({
      sessionId: sessionId
    });

    let response: Awaited<ReturnType<OpencodeClient['event']['subscribe']>> =
      await opencodeClient.event.subscribe(
        {},
        { signal: abortController.signal }
      );

    // console.log(
    //   `[oc-stream] startEventStream - subscribed sessionId=${item.sessionId}`
    // );

    this.activeStreams.set(sessionId, () => abortController.abort());

    this.lastEventTsMap.set(sessionId, Date.now());

    this.pendingStreamData.set(sessionId, {
      response: response
    });

    // console.log(
    //   `[oc-stream] startEventStream - fetchSessionStateFromOpencode for sessionId=${item.sessionId}`
    // );

    await this.fetchSessionStateFromOpencode({
      sessionId: sessionId,
      opencodeSessionId: opencodeSessionId,
      isSetReload: isSetReload
    });

    return Result.succeed(true);
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

        // console.log(
        //   `[oc-stream] stream ended naturally sessionId=${item.sessionId}`
        // );
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          logToConsoleBackend({
            log: new ServerError({
              message: 'BACKEND_SSE_STREAM_FAILED',
              originalError: e
            }),
            logLevel: 'Error',
            logger: this.logger,
            cs: this.cs
          });

          // console.log(
          //   `[oc-stream] stream failed sessionId=${item.sessionId} error=${e.message}`
          // );
        } else {
          // console.log(`[oc-stream] stream aborted sessionId=${item.sessionId}`);
        }
      }

      await this.stopEventStream({ sessionId: item.sessionId });

      await this.setSessionRequestedReloadTs({
        sessionId: item.sessionId
      });
    };

    // console.log(
    //   `[oc-stream] processEventStream started sessionId=${item.sessionId}`
    // );

    processStream();
  }

  async stopEventStream(item: { sessionId: string }): Promise<void> {
    let { sessionId } = item;

    // console.log('[oc-stream] stopEventStream started');

    let stopFn = this.activeStreams.get(sessionId);

    if (stopFn) {
      stopFn();
      this.activeStreams.delete(sessionId);
    }

    this.lastEventTsMap.delete(sessionId);
    this.sessionDrainService.cleanup({ sessionId: sessionId });
    await this.releaseStreamLock({ sessionId: sessionId });

    // console.log('[oc-stream] stopEventStream completed');
  }

  async respondToPermission(item: {
    sessionId: string;
    permissionId: string;
    reply: EditorPermissionReply;
  }): Result.ResultAsync<void, RespondToPermissionError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind('client', v =>
        this.editorOpencodeService.getOpenCodeClient({
          sessionId: v.sessionId
        })
      ),
      Result.andThrough(async v => {
        await v.client.permission.reply({
          requestID: v.permissionId,
          reply: v.reply
        });
        return Result.succeed();
      }),
      Result.map((v): void => undefined)
    );
  }

  async respondToQuestion(item: {
    sessionId: string;
    opencodeSessionId: string;
    questionId: string;
    answers: string[][];
  }): Result.ResultAsync<void, RespondToQuestionError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind('client', v =>
        this.editorOpencodeService.getOpenCodeClient({
          sessionId: v.sessionId
        })
      ),
      Result.andThrough(async v => {
        await v.client.question.reply({
          requestID: v.questionId,
          answers: v.answers
        });
        return Result.succeed();
      }),
      Result.map((v): void => undefined)
    );
  }

  async rejectQuestion(item: {
    sessionId: string;
    opencodeSessionId: string;
    questionId: string;
  }): Result.ResultAsync<void, RejectQuestionError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind('client', v =>
        this.editorOpencodeService.getOpenCodeClient({
          sessionId: v.sessionId
        })
      ),
      Result.andThrough(async v => {
        await v.client.question.reject({ requestID: v.questionId });
        return Result.succeed();
      }),
      Result.map((v): void => undefined)
    );
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
        // console.log(
        //   `[oc-stream] stream stalled for sessionId=${sessionId} elapsed=${elapsed}ms`
        // );

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
        // console.log(
        //   `[oc-stream] timed out after ${elapsed}ms for sessionId=${item.sessionId}`
        // );
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

      let clientResult: Result.Result<OpencodeClient, GetOpenCodeClientError> =
        await this.editorOpencodeService.getOpenCodeClient({
          sessionId: item.sessionId
        });

      if (Result.isFailure(clientResult)) {
        throw new ServerError({ message: clientResult.error.code });
      }

      let client: OpencodeClient = clientResult.value;

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

      let ocSessionResult: Result.Result<
        OcSessionTab,
        DbOcSessionsFindFirstError
      > = await this.db.ocSessions.findFirst({
        where: eq(ocSessionsTable.sessionId, item.sessionId)
      });

      if (Result.isFailure(ocSessionResult)) {
        throw new ServerError({ message: ocSessionResult.error.code });
      }

      let ocSessionTab: OcSessionTab = ocSessionResult.value;

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
        await this.db.packer.writeUnwrap({
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
          message: 'BACKEND_REFETCH_FROM_OPENCODE_FAILED',
          originalError: e
        }),
        logLevel: 'Error',
        logger: this.logger,
        cs: this.cs
      });
    }
  }

  async executeInteraction(item: {
    sessionId: string;
    opencodeSessionId: string;
    interactionType: InteractionType;
    message?: string;
    agent?: string;
    providerId?: string;
    modelId?: string;
    variant?: string;
    permissionId?: string;
    reply?: string;
    questionId?: string;
    answers?: string[][];
    messageId?: string;
    partId?: string;
    system?: string;
  }): Result.ResultAsync<ExecuteInteractionOutput, ExecuteInteractionError> {
    let {
      sessionId,
      opencodeSessionId,
      interactionType,
      message: inputMessage,
      agent,
      providerId,
      modelId,
      variant,
      permissionId,
      reply,
      questionId,
      answers,
      messageId,
      partId,
      system
    } = item;

    let clientResult: Result.Result<OpencodeClient, GetOpenCodeClientError> =
      await this.editorOpencodeService.getOpenCodeClient({
        sessionId: sessionId
      });

    if (Result.isFailure(clientResult)) {
      return clientResult;
    }

    let opencodeClient: OpencodeClient = clientResult.value;

    if (interactionType === 'Message') {
      let message: string = inputMessage ?? '';

      let promptBody: NonNullable<SessionPromptAsyncData['body']> = {
        parts: [
          {
            type: 'text',
            text: message,
            ...(partId ? { id: partId } : {})
          }
        ]
      };

      if (agent) {
        promptBody.agent = agent;
      }

      let ocProviderId = providerId;

      if (providerId === CODEX_PROVIDER_ID) {
        ocProviderId = OPENAI_PROVIDER_ID;
      } else if (providerId === OPENAI_PROVIDER_ID) {
        ocProviderId = OPENCODE_PROJECT_OPENAI_PROVIDER_ID;
      }

      if (ocProviderId && modelId) {
        promptBody.model = {
          providerID: ocProviderId,
          modelID: modelId
        };
      }

      if (variant) {
        promptBody.variant = variant;
      }

      if (messageId) {
        promptBody.messageID = messageId;
      }

      if (system) {
        promptBody.system = system;
      }

      await opencodeClient.session.promptAsync(
        {
          sessionID: opencodeSessionId,
          ...promptBody
        },
        { throwOnError: true }
      );

      // fix for missing user message part in returned opencode state, if it was sent to paused session
      if (messageId && partId) {
        try {
          let messageModel: UserMessage['model'] = {
            providerID: ocProviderId || '',
            modelID: modelId || '',
            variant: variant
          };

          let userMessage: UserMessage = {
            id: messageId,
            sessionID: opencodeSessionId,
            role: 'user',
            time: { created: Date.now() },
            agent: agent ?? '',
            model: messageModel
          };

          let userOcMessage: OcMessageTab =
            this.ocMessagesService.makeOcMessage({
              messageId: messageId,
              sessionId: sessionId,
              role: 'user',
              ocMessage: userMessage
            });

          let userPart: TextPart = {
            id: partId,
            sessionID: opencodeSessionId,
            messageID: messageId,
            type: 'text',
            text: message
          };

          let userOcPart: OcPartTab = this.ocPartsService.makeOcPart({
            partId: partId,
            messageId: messageId,
            sessionId: sessionId,
            ocPart: userPart
          });

          await this.db.writeUnwrap({
            insertOrUpdate: {
              ocMessages: [userOcMessage],
              ocParts: [userOcPart]
            }
          });
        } catch (e: any) {
          // console.log(
          //   `[oc-exec] failed to persist user message part sessionId=${item.sessionId} messageId=${item.messageId}: ${e?.message}`
          // );
        }
      }
    } else if (interactionType === 'Permission') {
      if (reply !== 'always' && reply !== 'once' && reply !== 'reject') {
        throw new Error('Invalid permission reply');
      }

      let permissionReply: EditorPermissionReply = reply;

      let permissionResult: Result.Result<void, RespondToPermissionError> =
        await this.respondToPermission({
          sessionId: sessionId,
          permissionId: permissionId,
          reply: permissionReply
        });

      if (Result.isFailure(permissionResult)) {
        return permissionResult;
      }
    } else if (interactionType === 'Question') {
      if (answers !== undefined) {
        let questionResult: Result.Result<void, RespondToQuestionError> =
          await this.respondToQuestion({
            sessionId: sessionId,
            opencodeSessionId: opencodeSessionId,
            questionId: questionId,
            answers: answers
          });

        if (Result.isFailure(questionResult)) {
          return questionResult;
        }
      } else {
        let questionResult: Result.Result<void, RejectQuestionError> =
          await this.rejectQuestion({
            sessionId: sessionId,
            opencodeSessionId: opencodeSessionId,
            questionId: questionId
          });

        if (Result.isFailure(questionResult)) {
          return questionResult;
        }
      }
    } else if (interactionType === 'Stop') {
      await opencodeClient.session.abort(
        {
          sessionID: opencodeSessionId
        },
        { throwOnError: true }
      );
    }

    return Result.succeed({ success: true });
  }

  async publishInteractCommand(item: {
    sessionId: string;
    opencodeSessionId: string;
    interactionType: InteractionType;
    message?: string;
    agent?: string;
    providerId?: string;
    modelId?: string;
    variant?: string;
    permissionId?: string;
    reply?: string;
    questionId?: string;
    answers?: string[][];
    messageId?: string;
    partId?: string;
    system?: string;
  }): Result.ResultAsync<
    ExecuteInteractionOutput,
    PublishInteractCommandError
  > {
    let {
      sessionId,
      opencodeSessionId,
      interactionType,
      message,
      agent,
      providerId,
      modelId,
      variant,
      permissionId,
      reply,
      questionId,
      answers,
      messageId,
      partId,
      system
    } = item;

    let correlationId: string = crypto.randomUUID();

    let replyTo = `${CHANNEL_OPENCODE_INTERACT_REPLY}:${correlationId}`;

    let sub: Redis = this.redisClient.duplicate();

    await sub.subscribe(replyTo);

    await this.redisClient.publish(
      CHANNEL_OPENCODE_STREAM_COMMAND,
      JSON.stringify({
        command: 'interact' satisfies OpencodeStreamCommand,
        sessionId: sessionId,
        replyTo: replyTo,
        payload: {
          opencodeSessionId: opencodeSessionId,
          interactionType: interactionType,
          message: message,
          agent: agent,
          providerId: providerId,
          modelId: modelId,
          variant: variant,
          permissionId: permissionId,
          reply: reply,
          questionId: questionId,
          answers: answers,
          messageId: messageId,
          partId: partId,
          system: system
        }
      })
    );

    let timeoutMs = 30_000;

    let interactionResult: Result.Result<
      ExecuteInteractionOutput,
      PublishInteractCommandError
    > = await new Promise<
      Result.Result<ExecuteInteractionOutput, PublishInteractCommandError>
    >(resolve => {
      let timer: ReturnType<typeof setTimeout> = setTimeout(() => {
        void sub.quit();

        resolve(
          Result.fail({
            code: 'BACKEND_INTERACT_TIMEOUT',
            customData: { sessionId: sessionId, timeoutMs: timeoutMs }
          })
        );
      }, timeoutMs);

      sub.on('message', (_channel, rawMessage) => {
        clearTimeout(timer);

        void sub.quit();

        try {
          let interaction: InteractCommandReply = JSON.parse(rawMessage);

          if (interaction.success) {
            resolve(Result.succeed(interaction));
          } else {
            resolve(
              Result.fail({
                code: 'BACKEND_INTERACT_FAILED',
                customData: { sessionId: sessionId, error: interaction.error }
              })
            );
          }
        } catch {
          resolve(
            Result.fail({
              code: 'BACKEND_INTERACT_FAILED',
              customData: { sessionId: sessionId }
            })
          );
        }
      });
    });

    return interactionResult;
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
          command: 'fetch' satisfies OpencodeStreamCommand,
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
              message: 'BACKEND_FETCH_TIMEOUT',
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
                  message: 'BACKEND_FETCH_FAILED',
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
                message: 'BACKEND_FETCH_FAILED',
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
                message: 'BACKEND_FETCH_FAILED',
                originalError: e
              }),
        logLevel: 'Error',
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
