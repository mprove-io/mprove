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
import { AgentModelApi } from '#common/interfaces/backend/agent-model-api';
import { ServerError } from '#common/models/server-error';

@Injectable()
export class AgentModelsAiService {
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
    enableLoadFromCache: boolean;
    forceLoadFromCache: boolean;
  }): Promise<AgentModelApi[]> {
    let {
      projectId,
      openaiApiKey,
      anthropicApiKey,
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
      openaiApiKey: openaiApiKey,
      anthropicApiKey: anthropicApiKey
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
  }): Promise<AgentModelApi[] | undefined> {
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
    models: AgentModelApi[];
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
          message: ErEnum.BACKEND_AGENT_MODELS_CACHE_PROVIDER_MODELS_ERROR,
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
  }): Promise<AgentModelApi[]> {
    let { openaiApiKey, anthropicApiKey } = item;

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

    let models: AgentModelApi[] = [];
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
    }

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

  private async fetchModelsDevCapabilities(item: {
    providerIds: string[];
  }): Promise<
    | Map<string, { toolcall: boolean; outputText: boolean; status: string }>
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
        { toolcall: boolean; outputText: boolean; status: string }
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
            status: model.status ?? 'active'
          });
        });
      });

      return capMap;
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
      return undefined;
    }
  }
}
