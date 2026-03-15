import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CoreMessage, LanguageModel } from 'ai';
import { asc, eq } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import { ocMessagesTable } from '#backend/drizzle/postgres/schema/oc-messages.js';
import { ocPartsTable } from '#backend/drizzle/postgres/schema/oc-parts.js';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { AgentModelApi } from '#common/interfaces/backend/agent-model-api';
import { ServerError } from '#common/models/server-error';
import { TabService } from './tab.service';

@Injectable()
export class AiSdkService {
  constructor(
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

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

  async listModels(item: {
    openaiApiKey?: string;
    anthropicApiKey?: string;
  }): Promise<AgentModelApi[]> {
    let { openaiApiKey, anthropicApiKey } = item;

    let models: AgentModelApi[] = [];

    let openaiPromise = openaiApiKey
      ? this.fetchOpenaiModels({ apiKey: openaiApiKey })
      : Promise.resolve([]);

    let anthropicPromise = anthropicApiKey
      ? this.fetchAnthropicModels({ apiKey: anthropicApiKey })
      : Promise.resolve([]);

    let [openaiModels, anthropicModels] = await Promise.all([
      openaiPromise,
      anthropicPromise
    ]);

    models.push(...openaiModels, ...anthropicModels);

    return models;
  }

  private async fetchOpenaiModels(item: {
    apiKey: string;
  }): Promise<AgentModelApi[]> {
    try {
      let response = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${item.apiKey}` }
      });

      if (!response.ok) {
        return [];
      }

      let data = (await response.json()) as {
        data: { id: string; owned_by: string }[];
      };

      let chatModels = data.data
        .filter(m => {
          let id = m.id;
          let isChat =
            id.startsWith('gpt-') ||
            id.startsWith('o1') ||
            id.startsWith('o3') ||
            id.startsWith('o4');
          let isNotLegacy =
            !id.includes('instruct') &&
            !id.includes('0301') &&
            !id.includes('0314');
          return isChat && isNotLegacy;
        })
        .map(m => ({
          id: m.id,
          name: m.id,
          providerId: 'openai',
          providerName: 'OpenAI'
        }));

      return chatModels;
    } catch (e) {
      logToConsoleBackend({
        log: new ServerError({
          message: ErEnum.BACKEND_AGENT_MODELS_CACHE_PROVIDER_MODELS_ERROR,
          originalError: e
        }),
        logLevel: LogLevelEnum.Info,
        logger: this.logger,
        cs: this.cs
      });
      return [];
    }
  }

  private async fetchAnthropicModels(item: {
    apiKey: string;
  }): Promise<AgentModelApi[]> {
    try {
      let response = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': item.apiKey,
          'anthropic-version': '2023-06-01'
        }
      });

      if (!response.ok) {
        return [];
      }

      let data = (await response.json()) as {
        data: { id: string; display_name: string }[];
      };

      let models = data.data.map(m => ({
        id: m.id,
        name: m.display_name || m.id,
        providerId: 'anthropic',
        providerName: 'Anthropic'
      }));

      return models;
    } catch (e) {
      logToConsoleBackend({
        log: new ServerError({
          message: ErEnum.BACKEND_AGENT_MODELS_CACHE_PROVIDER_MODELS_ERROR,
          originalError: e
        }),
        logLevel: LogLevelEnum.Info,
        logger: this.logger,
        cs: this.cs
      });
      return [];
    }
  }
}
