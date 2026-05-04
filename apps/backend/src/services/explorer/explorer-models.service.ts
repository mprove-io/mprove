import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { LanguageModel } from 'ai';
import { eq, sql } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import type { ModelsDevResponse } from '#backend/functions/opencode-models-dev';
import { ALLOWED_MODEL_KEYWORDS } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { isDefined } from '#common/functions/is-defined';
import { ServerError } from '#common/models/server-error';
import type { SessionModelApi } from '#common/zod/backend/session-model-api';

// Reference: external/opencode/packages/opencode/src/plugin/codex.ts lines 362-371
const CODEX_ALLOWED_MODELS: string[] = [
  'gpt-5.1-codex',
  'gpt-5.1-codex-max',
  'gpt-5.1-codex-mini',
  'gpt-5.2',
  'gpt-5.2-codex',
  'gpt-5.3-codex',
  'gpt-5.4',
  'gpt-5.4-mini'
];

@Injectable()
export class ExplorerModelsService {
  private MODELS_AI_TTL_MS = 60 * 60 * 1000; // 1 hour

  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getAiModels(item: {
    projectId: string;
    openaiApiKey?: string;
    anthropicApiKey?: string;
    isUserCodexAuthSet?: boolean;
    enableLoadFromCache: boolean;
    forceLoadFromCache: boolean;
  }): Promise<SessionModelApi[]> {
    let {
      projectId,
      openaiApiKey,
      anthropicApiKey,
      isUserCodexAuthSet,
      enableLoadFromCache,
      forceLoadFromCache
    } = item;

    if (forceLoadFromCache) {
      let cached = await this.readCache({
        projectId: projectId,
        ignoreTtl: true
      });

      if (cached) {
        return cached;
      }
    }

    if (enableLoadFromCache) {
      let cached = await this.readCache({
        projectId: projectId,
        ignoreTtl: false
      });

      if (cached) {
        return cached;
      }
    }

    let models = await this.fetchModels({
      openaiApiKey: isUserCodexAuthSet === true ? undefined : openaiApiKey,
      anthropicApiKey: anthropicApiKey,
      isUserCodexAuthSet: isUserCodexAuthSet
    });

    models = models.filter(m => {
      let idLower = m.id.toLowerCase();
      return ALLOWED_MODEL_KEYWORDS.some(kw => idLower.includes(kw));
    });

    await this.writeCache({
      projectId: projectId,
      models: models
    });

    return models;
  }

  private async readCache(item: {
    projectId: string;
    ignoreTtl: boolean;
  }): Promise<SessionModelApi[] | undefined> {
    let { projectId, ignoreTtl } = item;

    let row = await this.db.drizzle.query.projectsTable.findFirst({
      where: eq(projectsTable.projectId, projectId),
      columns: {
        providerModelsAi: true,
        providerModelsAiTs: true
      }
    });

    if (!row) {
      return undefined;
    }

    let providerModelsAi = row.providerModelsAi;
    let providerModelsAiTs = row.providerModelsAiTs;

    let hasModels = isDefined(providerModelsAi) && providerModelsAi.length > 0;

    let hasTs = isDefined(providerModelsAiTs);

    if (ignoreTtl) {
      if (hasModels && hasTs) {
        return providerModelsAi;
      }
      return undefined;
    }

    let isFresh =
      hasTs && Date.now() - providerModelsAiTs < this.MODELS_AI_TTL_MS;

    if (hasModels && isFresh) {
      return providerModelsAi;
    }

    return undefined;
  }

  private async writeCache(item: {
    projectId: string;
    models: SessionModelApi[];
  }): Promise<void> {
    let { projectId, models } = item;

    try {
      let modelsJson = JSON.stringify(models);
      let nowMs = Date.now();

      await this.db.drizzle.execute(
        sql`UPDATE projects SET provider_models_ai = ${modelsJson}::json, provider_models_ai_ts = ${nowMs} WHERE project_id = ${projectId}`
      );
    } catch (e: any) {
      logToConsoleBackend({
        log: new ServerError({
          message: ErEnum.BACKEND_MODELS_CACHE_PROVIDER_MODELS_ERROR,
          originalError: e
        }),
        logLevel: LogLevelEnum.Info,
        logger: this.logger,
        cs: this.cs
      });
    }
  }

  private async fetchModels(item: {
    openaiApiKey?: string;
    anthropicApiKey?: string;
    isUserCodexAuthSet?: boolean;
  }): Promise<SessionModelApi[]> {
    let { openaiApiKey, anthropicApiKey, isUserCodexAuthSet } = item;

    let openaiPromise = openaiApiKey
      ? this.fetchOpenaiModels({ apiKey: openaiApiKey })
      : Promise.resolve([]);

    let anthropicPromise = anthropicApiKey
      ? this.fetchAnthropicModels({ apiKey: anthropicApiKey })
      : Promise.resolve([]);

    let capMapPromise = this.fetchModelsDevCapabilities({
      providerIds: ['openai', 'anthropic']
    });

    let [openaiModels, anthropicModels, capMap] = await Promise.all([
      openaiPromise,
      anthropicPromise,
      capMapPromise
    ]);

    let models: SessionModelApi[] = [];
    models.push(...openaiModels, ...anthropicModels);

    if (capMap) {
      models = models.filter(m => {
        let cap = capMap.get(m.id);
        if (!cap) {
          return false;
        }

        let isNotDeprecated =
          cap.status !== 'deprecated' && cap.status !== 'alpha';
        let hasToolCall = cap.toolcall;
        let hasTextOutput = cap.outputText;

        return isNotDeprecated && hasToolCall && hasTextOutput;
      });

      models = models.map(m => ({
        id: m.id,
        name: m.name,
        providerId: m.providerId,
        providerName: m.providerName,
        variants: m.variants,
        contextLimit: capMap.get(m.id)?.contextLimit
      }));

      // Reference: external/opencode/packages/opencode/src/plugin/codex.ts lines 362-371
      if (isUserCodexAuthSet === true) {
        CODEX_ALLOWED_MODELS.forEach(modelId => {
          models.push({
            id: modelId,
            name: modelId,
            providerId: 'openai',
            providerName: 'OpenAI',
            contextLimit: capMap.get(modelId)?.contextLimit
          });
        });
      }
    }

    return models;
  }

  private async fetchOpenaiModels(item: {
    apiKey: string;
  }): Promise<SessionModelApi[]> {
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

      let models = data.data.map(m => ({
        id: m.id,
        name: m.id,
        providerId: 'openai',
        providerName: 'OpenAI'
      }));

      return models;
    } catch (e) {
      logToConsoleBackend({
        log: new ServerError({
          message: ErEnum.BACKEND_MODELS_CACHE_PROVIDER_MODELS_ERROR,
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
  }): Promise<SessionModelApi[]> {
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
          message: ErEnum.BACKEND_MODELS_CACHE_PROVIDER_MODELS_ERROR,
          originalError: e
        }),
        logLevel: LogLevelEnum.Info,
        logger: this.logger,
        cs: this.cs
      });
      return [];
    }
  }

  getModel(item: {
    provider: string;
    modelId: string;
    apiKey: string;
    useCodex: boolean;
    codexFetch: typeof fetch;
  }): LanguageModel {
    let { provider, modelId, apiKey, useCodex, codexFetch } = item;

    if (provider === 'openai') {
      let isCodex = useCodex === true && isDefined(codexFetch);

      let openai = isCodex
        ? createOpenAI({ apiKey: 'oauth-dummy-key', fetch: codexFetch })
        : createOpenAI({ apiKey: apiKey });

      return openai(modelId);
    } else if (provider === 'anthropic') {
      let anthropic = createAnthropic({ apiKey: apiKey });
      return anthropic(modelId);
    }

    throw new ServerError({
      message: ErEnum.BACKEND_PROMPT_FAILED
    });
  }

  // Reference: external/opencode/packages/opencode/src/provider/transform.ts
  // - options() lines 746-864 (chat/non-small)
  // - smallOptions() lines 866-879 (title/small)
  buildCodexProviderOptions(item: {
    modelId: string;
    sessionId: string;
    instructions: string;
    isSmall: boolean;
  }): { openai: Record<string, any> } {
    let { modelId, sessionId, instructions, isSmall } = item;

    let openai: Record<string, any> = {
      instructions: instructions,
      store: false,
      promptCacheKey: sessionId
    };

    let isGpt5 = modelId.includes('gpt-5');

    if (isSmall) {
      if (isGpt5) {
        openai.reasoningEffort = modelId.includes('5.') ? 'low' : 'minimal';
      }
    } else {
      let isGpt5Chat = modelId.includes('gpt-5-chat');
      let isGpt5Pro = modelId.includes('gpt-5-pro');

      if (isGpt5 && !isGpt5Chat && !isGpt5Pro) {
        openai.reasoningEffort = 'medium';
        openai.reasoningSummary = 'auto';
      }

      let isGpt5Dotted = modelId.includes('gpt-5.');
      let isCodexVariant = modelId.includes('codex');
      let isChatVariant = modelId.includes('-chat');

      if (isGpt5Dotted && !isCodexVariant && !isChatVariant) {
        openai.textVerbosity = 'low';
      }
    }

    return { openai: openai };
  }

  private async fetchModelsDevCapabilities(item: {
    providerIds: string[];
  }): Promise<
    | Map<
        string,
        {
          toolcall: boolean;
          outputText: boolean;
          status: string;
          contextLimit?: number;
        }
      >
    | undefined
  > {
    let { providerIds } = item;

    try {
      let response = await fetch('https://models.dev/api.json', {
        signal: AbortSignal.timeout(10_000)
      });

      let modelsDevResponse = (await response.json()) as ModelsDevResponse;

      let capMap = new Map<
        string,
        {
          toolcall: boolean;
          outputText: boolean;
          status: string;
          contextLimit?: number;
        }
      >();

      Object.entries(modelsDevResponse).forEach(([providerId, mdProvider]) => {
        let isIncluded = providerIds.includes(providerId);

        if (!isIncluded) {
          return;
        }

        Object.entries(mdProvider.models).forEach(([_modelKey, model]) => {
          capMap.set(model.id, {
            toolcall: model.tool_call,
            outputText: model.modalities?.output?.includes('text') ?? false,
            status: model.status ?? 'active',
            contextLimit: model.limit?.context
          });
        });
      });

      return capMap;
    } catch (e) {
      logToConsoleBackend({
        log: new ServerError({
          message: ErEnum.BACKEND_MODELS_CACHE_PROVIDER_MODELS_ERROR,
          originalError: e
        }),
        logLevel: LogLevelEnum.Info,
        logger: this.logger,
        cs: this.cs
      });
      return undefined;
    }
  }
}
