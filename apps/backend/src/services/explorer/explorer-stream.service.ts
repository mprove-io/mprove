import crypto from 'node:crypto';
import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ModelMessage } from 'ai';
import { streamText } from 'ai';
import { asc, eq } from 'drizzle-orm';
import { Redis } from 'ioredis';
import pIteration from 'p-iteration';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import { ocMessagesTable } from '#backend/drizzle/postgres/schema/oc-messages.js';
import { ocPartsTable } from '#backend/drizzle/postgres/schema/oc-parts.js';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import {
  CHANNEL_AI_INTERACT_REPLY,
  CHANNEL_AI_STREAM_COMMAND,
  KEY_AI_STREAM_OWNER
} from '#common/constants/top-backend';
import { AiStreamCommandEnum } from '#common/enums/ai-stream-command.enum';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { makeAscendingIdAfter } from '#common/functions/make-ascending-id';
import { ServerError } from '#common/models/server-error';
import { SessionDrainService } from '../session/session-drain.service';
import { TabService } from '../tab.service';
import { ExplorerCodexService } from './explorer-codex.service';
import { ExplorerEventsMakerService } from './explorer-events-maker.service';
import { ExplorerModelsService } from './explorer-models.service';
import { ExplorerPromptsService } from './explorer-prompts.service';
import { ExplorerTitleService } from './explorer-title.service';

const { forEachSeries } = pIteration;

@Injectable()
export class ExplorerStreamService implements OnModuleDestroy {
  private podId = crypto.randomUUID();

  private STREAM_LOCK_POLL_MS = 500;

  private STREAM_LOCK_TTL_SECONDS = 8;
  private STREAM_LOCK_WAIT_TIMEOUT_MS = 10_000;

  private redisClient: Redis;

  private redisSubscriber: Redis;

  private activeStreams = new Set<string>();

  private abortControllers = new Map<string, AbortController>();

  private pendingInteracts = new Map<
    string,
    Array<{
      provider: string;
      modelId: string;
      apiKey: string;
      userMessage: string;
      messageId: string;
      partId: string;
      useCodex: boolean;
      userId?: string;
    }>
  >();

  constructor(
    private cs: ConfigService<BackendConfig>,
    private sessionDrainService: SessionDrainService,
    private explorerCodexService: ExplorerCodexService,
    private explorerModelsService: ExplorerModelsService,
    private explorerPromptsService: ExplorerPromptsService,
    private explorerTitleService: ExplorerTitleService,
    private explorerEventsMakerService: ExplorerEventsMakerService,
    private tabService: TabService,
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

    this.redisSubscriber.subscribe(CHANNEL_AI_STREAM_COMMAND);

    this.redisSubscriber.on('message', (_channel, rawMessage) => {
      try {
        let parsed = JSON.parse(rawMessage);
        let { command, sessionId } = parsed;

        if (!this.activeStreams.has(sessionId)) {
          return;
        }

        if (command === AiStreamCommandEnum.Stop) {
          // console.log(`[ai-stream] received stop for sessionId=${sessionId}`);

          let ac = this.abortControllers.get(sessionId);
          ac.abort();
        } else if (command === AiStreamCommandEnum.SetTitle) {
          // console.log(
          //   `[ai-stream] received set-title for sessionId=${sessionId}`
          // );

          let titleEvent = this.explorerEventsMakerService.makeTitleEvent({
            title: parsed.title
          });
          this.sessionDrainService.enqueue({
            sessionId: sessionId,
            event: titleEvent
          });
        } else if (command === AiStreamCommandEnum.Interact) {
          let { replyTo, payload } = parsed;

          // console.log(
          //   `[ai-stream] received interact for sessionId=${sessionId}`
          // );

          let queue = this.pendingInteracts.get(sessionId);

          if (!queue) {
            queue = [];
            this.pendingInteracts.set(sessionId, queue);
          }

          queue.push({
            provider: payload.provider,
            modelId: payload.modelId,
            apiKey: payload.apiKey,
            userMessage: payload.userMessage,
            messageId: payload.messageId,
            partId: payload.partId,
            useCodex: payload.useCodex,
            userId: payload.userId
          });

          this.redisClient
            .publish(replyTo, JSON.stringify({ success: true }))
            .catch(() => {});
        }
      } catch (e) {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_AI_SDK_STREAM_COMMAND_FAILED,
            originalError: e
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      }
    });
  }

  // --- Pub/sub commands ---

  async publishStopSessionStream(item: {
    sessionId: string;
  }): Promise<boolean> {
    let key = `${KEY_AI_STREAM_OWNER}:${item.sessionId}`;
    let exists = await this.redisClient.exists(key);

    if (exists === 0) {
      return false;
    }

    await this.redisClient.publish(
      CHANNEL_AI_STREAM_COMMAND,
      JSON.stringify({
        command: AiStreamCommandEnum.Stop,
        sessionId: item.sessionId
      })
    );

    return true;
  }

  async publishInteractCommand(item: {
    sessionId: string;
    provider: string;
    modelId: string;
    apiKey: string;
    userMessage: string;
    messageId: string;
    partId: string;
    useCodex: boolean;
    userId?: string;
  }): Promise<{ success: boolean }> {
    let correlationId = crypto.randomUUID();

    let replyTo = `${CHANNEL_AI_INTERACT_REPLY}:${correlationId}`;

    let sub = this.redisClient.duplicate();

    await sub.subscribe(replyTo);

    await this.redisClient.publish(
      CHANNEL_AI_STREAM_COMMAND,
      JSON.stringify({
        command: AiStreamCommandEnum.Interact,
        sessionId: item.sessionId,
        replyTo: replyTo,
        payload: {
          provider: item.provider,
          modelId: item.modelId,
          apiKey: item.apiKey,
          userMessage: item.userMessage,
          messageId: item.messageId,
          partId: item.partId,
          useCodex: item.useCodex,
          userId: item.userId
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

      sub.on('message', (_channel: string, rawMessage: string) => {
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

  async setTitle(item: { sessionId: string; title: string }): Promise<void> {
    let key = `${KEY_AI_STREAM_OWNER}:${item.sessionId}`;
    let exists = await this.redisClient.exists(key);

    if (exists === 1) {
      await this.redisClient.publish(
        CHANNEL_AI_STREAM_COMMAND,
        JSON.stringify({
          command: AiStreamCommandEnum.SetTitle,
          sessionId: item.sessionId,
          title: item.title
        })
      );
    } else {
      let acquired = await this.tryAcquireStreamLock({
        sessionId: item.sessionId
      });
      if (!acquired) {
        // Race: another pod just acquired. Publish via pub/sub instead.
        await this.redisClient.publish(
          CHANNEL_AI_STREAM_COMMAND,
          JSON.stringify({
            command: AiStreamCommandEnum.SetTitle,
            sessionId: item.sessionId,
            title: item.title
          })
        );
        return;
      }

      await this.sessionDrainService.initEventCounter({
        sessionId: item.sessionId
      });

      let titleEvent = this.explorerEventsMakerService.makeTitleEvent({
        title: item.title
      });

      this.sessionDrainService.enqueue({
        sessionId: item.sessionId,
        event: titleEvent
      });

      await new Promise<void>(resolve => {
        this.sessionDrainService.markDoneProducing({
          sessionId: item.sessionId,
          callback: () => {
            this.releaseStreamLock({ sessionId: item.sessionId }).then(resolve);
          }
        });
      });
    }
  }

  // --- Locking ---

  async tryAcquireStreamLock(item: { sessionId: string }): Promise<boolean> {
    let { sessionId } = item;

    let result = await this.redisClient.set(
      `${KEY_AI_STREAM_OWNER}:${sessionId}`,
      this.podId,
      'EX',
      this.STREAM_LOCK_TTL_SECONDS,
      'NX'
    );

    return result === 'OK';
  }

  private async releaseStreamLock(item: { sessionId: string }): Promise<void> {
    let { sessionId } = item;
    await this.redisClient.eval(
      `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end`,
      1,
      `${KEY_AI_STREAM_OWNER}:${sessionId}`,
      this.podId
    );
  }

  async waitForStreamLockRelease(item: { sessionId: string }): Promise<void> {
    let key = `${KEY_AI_STREAM_OWNER}:${item.sessionId}`;
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
        //   `[ai-stream] timed out after ${elapsed}ms for sessionId=${item.sessionId}`
        // );
        return;
      }

      await new Promise(r => setTimeout(r, this.STREAM_LOCK_POLL_MS));
    }
  }

  private async waitForStreamLock(item: {
    sessionId: string;
  }): Promise<boolean> {
    let { sessionId } = item;
    let startTs = Date.now();

    while (true) {
      let acquired = await this.tryAcquireStreamLock({ sessionId: sessionId });
      if (acquired) {
        return true;
      }

      let elapsed = Date.now() - startTs;
      if (elapsed >= this.STREAM_LOCK_WAIT_TIMEOUT_MS) {
        return false;
      }

      await new Promise(r => setTimeout(r, this.STREAM_LOCK_POLL_MS));
    }
  }

  // --- Stream message ---

  async streamMessage(item: {
    sessionId: string;
    provider: string;
    modelId: string;
    apiKey: string;
    userMessage: string;
    messageId: string;
    partId: string;
    isLockAcquired: boolean;
    useCodex: boolean;
    userId?: string;
  }): Promise<void> {
    let { sessionId, isLockAcquired } = item;

    if (isLockAcquired === false) {
      // Acquire lock
      let isAcquired = await this.waitForStreamLock({ sessionId: sessionId });

      if (isAcquired === false) {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_PROMPT_FAILED,
            originalError: new Error(
              `Failed to acquire stream lock for session ${sessionId}`
            )
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });

        return;
      }
    }

    this.activeStreams.add(sessionId);

    let currentParams = {
      provider: item.provider,
      modelId: item.modelId,
      apiKey: item.apiKey,
      userMessage: item.userMessage,
      messageId: item.messageId,
      partId: item.partId,
      useCodex: item.useCodex,
      userId: item.userId
    };

    while (true) {
      let abortController = new AbortController();

      this.abortControllers.set(sessionId, abortController);

      try {
        await this.sessionDrainService.initEventCounter({
          sessionId: sessionId
        });

        await this.runProducer({
          sessionId: sessionId,
          provider: currentParams.provider,
          modelId: currentParams.modelId,
          apiKey: currentParams.apiKey,
          userMessage: currentParams.userMessage,
          abortController: abortController,
          messageId: currentParams.messageId,
          partId: currentParams.partId,
          useCodex: currentParams.useCodex,
          userId: currentParams.userId
        });
      } catch (e: any) {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_PROMPT_FAILED,
            originalError: e
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });

        // Emit error + idle
        let errorEvent = this.explorerEventsMakerService.makeErrorEvent({
          errorMessage: e?.message || 'AI SDK streaming failed'
        });
        this.sessionDrainService.enqueue({
          sessionId: sessionId,
          event: errorEvent
        });

        let idleEvent = this.explorerEventsMakerService.makeIdleEvent();
        this.sessionDrainService.enqueue({
          sessionId: sessionId,
          event: idleEvent
        });
      }

      // Wait for drain to flush all events before checking queue
      await new Promise<void>(resolve => {
        this.sessionDrainService.markDoneProducing({
          sessionId: sessionId,
          callback: () => resolve()
        });
      });

      // Check for queued interact
      let queue = this.pendingInteracts.get(sessionId);
      let nextInteract = queue?.shift();

      if (!nextInteract) {
        this.pendingInteracts.delete(sessionId);
        break;
      }

      currentParams = {
        provider: nextInteract.provider,
        modelId: nextInteract.modelId,
        apiKey: nextInteract.apiKey,
        userMessage: nextInteract.userMessage,
        messageId: nextInteract.messageId,
        partId: nextInteract.partId,
        useCodex: nextInteract.useCodex,
        userId: nextInteract.userId
      };
    }

    // Cleanup + release lock
    this.activeStreams.delete(sessionId);
    this.abortControllers.delete(sessionId);
    await this.releaseStreamLock({ sessionId: sessionId });
  }

  async refreshActiveLocks(): Promise<void> {
    let activeStreamSessionIds = [...this.activeStreams.keys()];

    await forEachSeries(activeStreamSessionIds, async sessionId => {
      let result = await this.redisClient.eval(
        `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("expire", KEYS[1], ${this.STREAM_LOCK_TTL_SECONDS}) else return 0 end`,
        1,
        `${KEY_AI_STREAM_OWNER}:${sessionId}`,
        this.podId
      );
      return result !== 0;
    });
  }

  // --- Producer ---

  private async runProducer(item: {
    sessionId: string;
    provider: string;
    modelId: string;
    apiKey: string;
    userMessage: string;
    abortController: AbortController;
    messageId: string;
    partId: string;
    useCodex: boolean;
    userId?: string;
  }): Promise<void> {
    let {
      sessionId,
      provider,
      modelId,
      apiKey,
      userMessage,
      abortController,
      messageId,
      partId,
      useCodex,
      userId
    } = item;

    let history = await this.loadMessageHistory({
      sessionId: sessionId
    });

    // Pre-streaming events
    let busyEvent = this.explorerEventsMakerService.makeBusyEvent();

    this.sessionDrainService.enqueue({
      sessionId: sessionId,
      event: busyEvent
    });

    let userMessageId = messageId;

    let userMsgEvent = this.explorerEventsMakerService.makeUserMessageEvent({
      messageId: userMessageId,
      sessionId: sessionId,
      provider: provider,
      modelId: modelId
    });
    this.sessionDrainService.enqueue({
      sessionId: sessionId,
      event: userMsgEvent
    });

    let userPartId = partId;

    let userPartEvent = this.explorerEventsMakerService.makeUserPartEvent({
      partId: userPartId,
      messageId: userMessageId,
      sessionId: sessionId,
      text: userMessage
    });
    this.sessionDrainService.enqueue({
      sessionId: sessionId,
      event: userPartEvent
    });

    let assistantMessageId = makeAscendingIdAfter({
      prefix: 'msg',
      afterId: userMessageId
    });

    let assistantMsgEvent =
      this.explorerEventsMakerService.makeAssistantMessageEvent({
        messageId: assistantMessageId,
        sessionId: sessionId
      });
    this.sessionDrainService.enqueue({
      sessionId: sessionId,
      event: assistantMsgEvent
    });

    let assistantPartId = makeAscendingIdAfter({
      prefix: 'prt',
      afterId: userPartId
    });

    let assistantPartEvent =
      this.explorerEventsMakerService.makeAssistantPartEvent({
        partId: assistantPartId,
        messageId: assistantMessageId,
        sessionId: sessionId
      });
    this.sessionDrainService.enqueue({
      sessionId: sessionId,
      event: assistantPartEvent
    });

    // Build codex fetch if needed (reads fresh auth from DB)
    let codexFetch =
      useCodex === true && userId
        ? await this.explorerCodexService.buildCodexFetch({
            userId: userId,
            sessionId: sessionId
          })
        : undefined;

    // Start title generation in parallel
    let isFirstMessage = history.length === 0;

    let titlePromise = isFirstMessage
      ? this.explorerTitleService.generateTitleText({
          sessionId: sessionId,
          provider: provider,
          modelId: modelId,
          apiKey: apiKey,
          userMessage: userMessage,
          useCodex: useCodex,
          codexFetch: codexFetch
        })
      : undefined;

    // Stream AI response
    let model = this.explorerModelsService.getModel({
      provider: provider,
      modelId: modelId,
      apiKey: apiKey,
      useCodex: useCodex,
      codexFetch: codexFetch
    });

    let messages = [
      ...history,
      { role: 'user' as const, content: userMessage }
    ];

    let providerOptions =
      useCodex === true
        ? this.explorerModelsService.buildCodexProviderOptions({
            modelId: modelId,
            sessionId: sessionId,
            instructions:
              this.explorerPromptsService.getExplorerSessionSystemPrompt(),
            isSmall: false
          })
        : undefined;

    let result = streamText({
      model: model,
      messages: messages,
      abortSignal: abortController.signal,
      providerOptions: providerOptions
    });

    let fullContent = '';
    let wasAborted = false;

    try {
      for await (let chunk of result.textStream) {
        fullContent += chunk;

        let deltaEvent = this.explorerEventsMakerService.makeTextDeltaEvent({
          messageId: assistantMessageId,
          partId: assistantPartId,
          delta: chunk
        });
        this.sessionDrainService.enqueue({
          sessionId: sessionId,
          event: deltaEvent
        });
      }
    } catch (e: any) {
      if (e.name === 'AbortError') {
        wasAborted = true;
      } else {
        throw e;
      }
    }

    if (wasAborted) {
      let finalPartEvent = this.explorerEventsMakerService.makeFinalPartEvent({
        partId: assistantPartId,
        messageId: assistantMessageId,
        sessionId: sessionId,
        text: fullContent
      });

      this.sessionDrainService.enqueue({
        sessionId: sessionId,
        event: finalPartEvent
      });

      let abortedMsgEvent =
        this.explorerEventsMakerService.makeAbortedMessageEvent({
          messageId: assistantMessageId,
          sessionId: sessionId
        });

      this.sessionDrainService.enqueue({
        sessionId: sessionId,
        event: abortedMsgEvent
      });

      let idleEvent = this.explorerEventsMakerService.makeIdleEvent();

      this.sessionDrainService.enqueue({
        sessionId: sessionId,
        event: idleEvent
      });
    } else {
      let finalPartEvent = this.explorerEventsMakerService.makeFinalPartEvent({
        partId: assistantPartId,
        messageId: assistantMessageId,
        sessionId: sessionId,
        text: fullContent
      });
      this.sessionDrainService.enqueue({
        sessionId: sessionId,
        event: finalPartEvent
      });

      let idleEvent = this.explorerEventsMakerService.makeIdleEvent();
      this.sessionDrainService.enqueue({
        sessionId: sessionId,
        event: idleEvent
      });

      // Await title generation
      if (titlePromise) {
        let title = await titlePromise;

        if (title) {
          let titleEvent = this.explorerEventsMakerService.makeTitleEvent({
            title: title
          });
          this.sessionDrainService.enqueue({
            sessionId: sessionId,
            event: titleEvent
          });
        }
      }
    }
  }

  async loadMessageHistory(item: {
    sessionId: string;
  }): Promise<ModelMessage[]> {
    let { sessionId } = item;

    let messageEnts = await this.db.drizzle.query.ocMessagesTable.findMany({
      where: eq(ocMessagesTable.sessionId, sessionId),
      orderBy: [asc(ocMessagesTable.createdTs)]
    });

    let messageTabs = messageEnts.map(m =>
      this.tabService.ocMessageEntToTab(m)
    );

    let partEnts = await this.db.drizzle.query.ocPartsTable.findMany({
      where: eq(ocPartsTable.sessionId, sessionId),
      orderBy: [asc(ocPartsTable.createdTs)]
    });

    let partTabs = partEnts.map(p => this.tabService.ocPartEntToTab(p));

    let partsByMessageId = new Map<string, typeof partTabs>();

    partTabs.forEach(part => {
      let existing = partsByMessageId.get(part.messageId);
      if (existing) {
        existing.push(part);
      } else {
        partsByMessageId.set(part.messageId, [part]);
      }
    });

    let coreMessages: ModelMessage[] = [];

    messageTabs.forEach(msg => {
      let msgParts = partsByMessageId.get(msg.messageId) || [];
      let textContent = msgParts
        .filter(p => p.type === 'text')
        .map(p => ((p.ocPart as Record<string, unknown>).text as string) || '')
        .join('');

      if (msg.role === 'user') {
        coreMessages.push({ role: 'user', content: textContent });
      } else if (msg.role === 'assistant') {
        coreMessages.push({ role: 'assistant', content: textContent });
      }
    });

    return coreMessages;
  }

  onModuleDestroy() {
    this.redisSubscriber.disconnect();
    this.redisClient.disconnect();
  }
}
