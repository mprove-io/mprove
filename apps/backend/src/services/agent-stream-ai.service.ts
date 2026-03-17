import crypto from 'node:crypto';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Event } from '@opencode-ai/sdk/v2';
import type { CoreMessage, LanguageModel } from 'ai';
import { generateText, streamText } from 'ai';
import { asc, eq, sql } from 'drizzle-orm';
import { Redis } from 'ioredis';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import { ocMessagesTable } from '#backend/drizzle/postgres/schema/oc-messages.js';
import { ocPartsTable } from '#backend/drizzle/postgres/schema/oc-parts.js';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { makeAscendingId } from '#common/functions/make-ascending-id';
import { ServerError } from '#common/models/server-error';
import { AgentDrainService } from './agent-drain.service';
import { TabService } from './tab.service';

@Injectable()
export class AgentStreamAiService implements OnModuleDestroy {
  private podId = crypto.randomUUID();

  private static STREAM_LOCK_TTL_SECONDS = 16;
  private static STREAM_LOCK_WAIT_TIMEOUT_MS = 30_000;
  private static STREAM_LOCK_POLL_MS = 500;

  private static AI_SDK_COMMAND_CHANNEL = 'ai-sdk-stream-command';

  private redisClient: Redis;

  private redisSubscriber: Redis;

  private activeStreams = new Set<string>();

  private abortControllers = new Map<string, AbortController>();

  constructor(
    private cs: ConfigService<BackendConfig>,
    private agentDrainService: AgentDrainService,
    private logger: Logger,
    private tabService: TabService,
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

    this.redisSubscriber.subscribe(AgentStreamAiService.AI_SDK_COMMAND_CHANNEL);

    this.redisSubscriber.on('message', (_channel, rawMessage) => {
      try {
        let parsed = JSON.parse(rawMessage);
        let { command, sessionId } = parsed;

        if (command === 'abort' && this.activeStreams.has(sessionId)) {
          this.handleAbortCommand({ sessionId: sessionId });
        } else if (
          command === 'set-title' &&
          this.activeStreams.has(sessionId)
        ) {
          this.handleSetTitleCommand({
            sessionId: sessionId,
            title: parsed.title
          });
        }
      } catch (e) {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_AGENT_AI_SDK_STREAM_COMMAND_FAILED,
            originalError: e
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      }
    });
  }

  // --- Locking ---

  private makeStreamLockKey(sessionId: string): string {
    return `ai-stream-owner:${sessionId}`;
  }

  private async tryAcquireStreamLock(sessionId: string): Promise<boolean> {
    let result = await this.redisClient.set(
      this.makeStreamLockKey(sessionId),
      this.podId,
      'EX',
      AgentStreamAiService.STREAM_LOCK_TTL_SECONDS,
      'NX'
    );
    return result === 'OK';
  }

  private async refreshStreamLock(sessionId: string): Promise<boolean> {
    let result = await this.redisClient.eval(
      `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("expire", KEYS[1], ${AgentStreamAiService.STREAM_LOCK_TTL_SECONDS}) else return 0 end`,
      1,
      this.makeStreamLockKey(sessionId),
      this.podId
    );
    return result !== 0;
  }

  private async releaseStreamLock(sessionId: string): Promise<void> {
    await this.redisClient.eval(
      `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end`,
      1,
      this.makeStreamLockKey(sessionId),
      this.podId
    );
  }

  private async waitForStreamLock(sessionId: string): Promise<boolean> {
    let startTs = Date.now();

    while (true) {
      let acquired = await this.tryAcquireStreamLock(sessionId);
      if (acquired) {
        return true;
      }

      let elapsed = Date.now() - startTs;
      if (elapsed >= AgentStreamAiService.STREAM_LOCK_WAIT_TIMEOUT_MS) {
        return false;
      }

      await new Promise(r =>
        setTimeout(r, AgentStreamAiService.STREAM_LOCK_POLL_MS)
      );
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
        elapsed >= AgentStreamAiService.STREAM_LOCK_WAIT_TIMEOUT_MS;

      if (isTimedOut) {
        console.log(
          `[waitForStreamLockRelease] timed out after ${elapsed}ms for sessionId=${item.sessionId}`
        );
        return;
      }

      await new Promise(r =>
        setTimeout(r, AgentStreamAiService.STREAM_LOCK_POLL_MS)
      );
    }
  }

  // --- Pub/sub commands ---

  async publishAbortStream(item: { sessionId: string }): Promise<boolean> {
    let key = this.makeStreamLockKey(item.sessionId);
    let exists = await this.redisClient.exists(key);

    if (exists === 0) {
      return false;
    }

    await this.redisClient.publish(
      AgentStreamAiService.AI_SDK_COMMAND_CHANNEL,
      JSON.stringify({ command: 'abort', sessionId: item.sessionId })
    );

    return true;
  }

  async setTitle(item: { sessionId: string; title: string }): Promise<void> {
    let key = this.makeStreamLockKey(item.sessionId);
    let exists = await this.redisClient.exists(key);

    if (exists === 1) {
      await this.redisClient.publish(
        AgentStreamAiService.AI_SDK_COMMAND_CHANNEL,
        JSON.stringify({
          command: 'set-title',
          sessionId: item.sessionId,
          title: item.title
        })
      );
    } else {
      let acquired = await this.tryAcquireStreamLock(item.sessionId);
      if (!acquired) {
        // Race: another pod just acquired. Publish via pub/sub instead.
        await this.redisClient.publish(
          AgentStreamAiService.AI_SDK_COMMAND_CHANNEL,
          JSON.stringify({
            command: 'set-title',
            sessionId: item.sessionId,
            title: item.title
          })
        );
        return;
      }

      try {
        await this.agentDrainService.initEventCounter(item.sessionId);

        let titleEvent: Event = {
          type: 'session.updated',
          properties: { info: { title: item.title } }
        } as Event;

        this.agentDrainService.enqueue({
          sessionId: item.sessionId,
          event: titleEvent
        });

        await this.agentDrainService.drainQueue(item.sessionId);
      } finally {
        this.agentDrainService.cleanup(item.sessionId);
        await this.releaseStreamLock(item.sessionId);
      }
    }
  }

  // --- Command handlers ---

  private handleAbortCommand(item: { sessionId: string }): void {
    console.log(
      `[ai-sdk-abort] received abort for sessionId=${item.sessionId}`
    );

    let ac = this.abortControllers.get(item.sessionId);
    if (ac) {
      ac.abort();
    }
  }

  private handleSetTitleCommand(item: {
    sessionId: string;
    title: string;
  }): void {
    console.log(
      `[ai-sdk-set-title] received set-title for sessionId=${item.sessionId}`
    );

    if (this.activeStreams.has(item.sessionId)) {
      let titleEvent: Event = {
        type: 'session.updated',
        properties: { info: { title: item.title } }
      } as Event;
      this.agentDrainService.enqueue({
        sessionId: item.sessionId,
        event: titleEvent
      });
    }
  }

  // --- Stream message ---

  async streamMessage(item: {
    sessionId: string;
    provider: string;
    modelId: string;
    apiKey: string;
    userMessage: string;
  }): Promise<void> {
    let { sessionId, provider, modelId, apiKey, userMessage } = item;

    // Acquire lock
    let acquired = await this.waitForStreamLock(sessionId);
    if (!acquired) {
      logToConsoleBackend({
        log: new ServerError({
          message: ErEnum.BACKEND_AGENT_PROMPT_FAILED,
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

    let abortController = new AbortController();
    this.activeStreams.add(sessionId);
    this.abortControllers.set(sessionId, abortController);

    try {
      await this.agentDrainService.initEventCounter(sessionId);

      await this.runProducer({
        sessionId: sessionId,
        provider: provider,
        modelId: modelId,
        apiKey: apiKey,
        userMessage: userMessage,
        abortController: abortController
      });

      await this.agentDrainService.drainQueue(sessionId);

      // Update last_activity_ts
      await this.db.drizzle.transaction(async tx => {
        await tx.execute(
          sql`UPDATE sessions SET last_activity_ts = ${Date.now()} WHERE session_id = ${sessionId}`
        );
      });
    } catch (e: any) {
      logToConsoleBackend({
        log: new ServerError({
          message: ErEnum.BACKEND_AGENT_PROMPT_FAILED,
          originalError: e
        }),
        logLevel: LogLevelEnum.Error,
        logger: this.logger,
        cs: this.cs
      });

      // Emit error + idle
      try {
        let errorEvent = {
          type: 'session.error',
          properties: {
            error: { message: e?.message || 'AI SDK streaming failed' }
          }
        } as unknown as Event;
        this.agentDrainService.enqueue({
          sessionId: sessionId,
          event: errorEvent
        });

        let idleEvent: Event = {
          type: 'session.status',
          properties: { status: { type: 'idle' } }
        } as Event;
        this.agentDrainService.enqueue({
          sessionId: sessionId,
          event: idleEvent
        });

        await this.agentDrainService.drainQueue(sessionId);
      } catch (drainError) {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_AGENT_DRAIN_QUEUE_FAILED,
            originalError: drainError
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      }
    } finally {
      this.activeStreams.delete(sessionId);
      this.abortControllers.delete(sessionId);

      this.agentDrainService.cleanup(sessionId);
      await this.releaseStreamLock(sessionId);
    }
  }

  // --- Producer ---

  private async runProducer(item: {
    sessionId: string;
    provider: string;
    modelId: string;
    apiKey: string;
    userMessage: string;
    abortController: AbortController;
  }): Promise<void> {
    let { sessionId, provider, modelId, apiKey, userMessage, abortController } =
      item;

    let history = await this.loadMessageHistory({
      sessionId: sessionId
    });

    // Pre-streaming events
    let busyEvent: Event = {
      type: 'session.status',
      properties: { status: { type: 'busy' } }
    } as Event;
    this.agentDrainService.enqueue({ sessionId: sessionId, event: busyEvent });

    let userMessageId = makeAscendingId({ prefix: 'msg' });

    let userMsgEvent: Event = {
      type: 'message.updated',
      properties: {
        info: { id: userMessageId, sessionID: sessionId, role: 'user' }
      }
    } as Event;
    this.agentDrainService.enqueue({
      sessionId: sessionId,
      event: userMsgEvent
    });

    let userPartId = makeAscendingId({ prefix: 'prt' });

    let userPartEvent: Event = {
      type: 'message.part.updated',
      properties: {
        part: {
          id: userPartId,
          messageID: userMessageId,
          sessionID: sessionId,
          type: 'text',
          text: userMessage
        }
      }
    } as Event;
    this.agentDrainService.enqueue({
      sessionId: sessionId,
      event: userPartEvent
    });

    let assistantMessageId = makeAscendingId({ prefix: 'msg' });

    let assistantMsgEvent: Event = {
      type: 'message.updated',
      properties: {
        info: {
          id: assistantMessageId,
          sessionID: sessionId,
          role: 'assistant'
        }
      }
    } as Event;
    this.agentDrainService.enqueue({
      sessionId: sessionId,
      event: assistantMsgEvent
    });

    let assistantPartId = makeAscendingId({ prefix: 'prt' });

    let assistantPartEvent: Event = {
      type: 'message.part.updated',
      properties: {
        part: {
          id: assistantPartId,
          messageID: assistantMessageId,
          sessionID: sessionId,
          type: 'text',
          text: ''
        }
      }
    } as Event;
    this.agentDrainService.enqueue({
      sessionId: sessionId,
      event: assistantPartEvent
    });

    // Start title generation in parallel
    let isFirstMessage = history.length === 0;

    let titlePromise = isFirstMessage
      ? this.generateTitleText({
          provider: provider,
          modelId: modelId,
          apiKey: apiKey,
          userMessage: userMessage
        })
      : undefined;

    // Stream AI response
    let model = this.getModel({
      provider: provider,
      modelId: modelId,
      apiKey: apiKey
    });

    let messages = [
      ...history,
      { role: 'user' as const, content: userMessage }
    ];

    let result = streamText({
      model: model,
      messages: messages,
      abortSignal: abortController.signal
    });

    let fullContent = '';
    let wasAborted = false;

    try {
      for await (let chunk of result.textStream) {
        fullContent += chunk;

        let deltaEvent: Event = {
          type: 'message.part.delta',
          properties: {
            messageID: assistantMessageId,
            partID: assistantPartId,
            field: 'text',
            delta: chunk
          }
        } as Event;
        this.agentDrainService.enqueue({
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
      let idleEvent: Event = {
        type: 'session.status',
        properties: { status: { type: 'idle' } }
      } as Event;
      this.agentDrainService.enqueue({
        sessionId: sessionId,
        event: idleEvent
      });
    } else {
      let finalPartEvent: Event = {
        type: 'message.part.updated',
        properties: {
          part: {
            id: assistantPartId,
            messageID: assistantMessageId,
            sessionID: sessionId,
            type: 'text',
            text: fullContent
          }
        }
      } as Event;
      this.agentDrainService.enqueue({
        sessionId: sessionId,
        event: finalPartEvent
      });

      let idleEvent: Event = {
        type: 'session.status',
        properties: { status: { type: 'idle' } }
      } as Event;
      this.agentDrainService.enqueue({
        sessionId: sessionId,
        event: idleEvent
      });

      // Await title generation
      if (titlePromise) {
        try {
          let title = await titlePromise;

          if (title) {
            let titleEvent: Event = {
              type: 'session.updated',
              properties: { info: { title: title } }
            } as Event;
            this.agentDrainService.enqueue({
              sessionId: sessionId,
              event: titleEvent
            });
          }
        } catch (titleError) {
          logToConsoleBackend({
            log: new ServerError({
              message: ErEnum.BACKEND_AGENT_PROMPT_FAILED,
              originalError: titleError
            }),
            logLevel: LogLevelEnum.Info,
            logger: this.logger,
            cs: this.cs
          });
        }
      }
    }
  }

  // --- Title generation ---

  private static TITLE_SYSTEM_PROMPT =
    `You are a title generator. You output ONLY a thread title. Nothing else.

<task>
Generate a brief title that would help the user find this conversation later.

Follow all rules in <rules>
Use the <examples> so you know what a good title looks like.
Your output must be:
- A single line
- ≤50 characters
- No explanations
</task>

<rules>
- you MUST use the same language as the user message you are summarizing
- Title must be grammatically correct and read naturally - no word salad
- Never include tool names in the title (e.g. "read tool", "bash tool", "edit tool")
- Focus on the main topic or question the user needs to retrieve
- Vary your phrasing - avoid repetitive patterns like always starting with "Analyzing"
- When a file is mentioned, focus on WHAT the user wants to do WITH the file, not just that they shared it
- Keep exact: technical terms, numbers, filenames, HTTP codes
- Remove: the, this, my, a, an
- Never assume tech stack
- Never use tools
- NEVER respond to questions, just generate a title for the conversation
- The title should NEVER include "summarizing" or "generating" when generating a title
- DO NOT SAY YOU CANNOT GENERATE A TITLE OR COMPLAIN ABOUT THE INPUT
- Always output something meaningful, even if the input is minimal.
- If the user message is short or conversational (e.g. "hello", "lol", "what's up", "hey"):
  → create a title that reflects the user's tone or intent (such as Greeting, Quick check-in, Light chat, Intro message, etc.)
</rules>

<examples>
"debug 500 errors in production" → Debugging production 500 errors
"refactor user service" → Refactoring user service
"why is app.js failing" → app.js failure investigation
"implement rate limiting" → Rate limiting implementation
"how do I connect postgres to my API" → Postgres API connection
"best practices for React hooks" → React hooks best practices
"@src/auth.ts can you add refresh token support" → Auth refresh token support
"@utils/parser.ts this is broken" → Parser bug fix
"look at @config.json" → Config review
"@App.tsx add dark mode toggle" → Dark mode toggle in App
</examples>`;

  private async generateTitleText(item: {
    provider: string;
    modelId: string;
    apiKey: string;
    userMessage: string;
  }): Promise<string | undefined> {
    let { provider, modelId, apiKey, userMessage } = item;

    let model = this.getModel({
      provider: provider,
      modelId: modelId,
      apiKey: apiKey
    });

    let result = await generateText({
      model: model,
      system: AgentStreamAiService.TITLE_SYSTEM_PROMPT,
      prompt: `Generate a title for this conversation:\n${userMessage}`
    });

    let text = result.text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    let firstLine = text.split('\n').find(line => line.trim().length > 0);

    if (!firstLine) {
      return undefined;
    }

    let title = firstLine.trim();

    if (title.length > 100) {
      title = title.slice(0, 97) + '...';
    }

    return title;
  }

  async refreshActiveLocks(): Promise<void> {
    for (let sessionId of this.activeStreams.keys()) {
      await this.refreshStreamLock(sessionId);
    }
  }

  //

  getModel(item: {
    provider: string;
    modelId: string;
    apiKey: string;
  }): LanguageModel {
    let { provider, modelId, apiKey } = item;

    if (provider === 'openai') {
      let openai = createOpenAI({ apiKey: apiKey });
      return openai(modelId);
    } else if (provider === 'anthropic') {
      let anthropic = createAnthropic({ apiKey: apiKey });
      return anthropic(modelId);
    }

    throw new ServerError({
      message: ErEnum.BACKEND_AGENT_PROMPT_FAILED
    });
  }

  async loadMessageHistory(item: {
    sessionId: string;
  }): Promise<CoreMessage[]> {
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

    for (let part of partTabs) {
      let existing = partsByMessageId.get(part.messageId);
      if (existing) {
        existing.push(part);
      } else {
        partsByMessageId.set(part.messageId, [part]);
      }
    }

    let coreMessages: CoreMessage[] = [];

    for (let msg of messageTabs) {
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
    }

    return coreMessages;
  }

  onModuleDestroy() {
    this.redisSubscriber.disconnect();
    this.redisClient.disconnect();
  }
}
