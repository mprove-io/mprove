import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq, sql } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import {
  fromModelsDevProvider,
  type ModelsDevResponse
} from '#backend/functions/opencode-models-dev';
import {
  ALLOWED_MODEL_KEYWORDS,
  MODEL_PROVIDERS
} from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { isDefined } from '#common/functions/is-defined';
import { SessionModelApi } from '#common/interfaces/backend/session-model-api';
import { ServerError } from '#common/models/server-error';

@Injectable()
export class EditorModelsService {
  private MODELS_DEV_TTL_MS = 60 * 60 * 1000; // 1 hour

  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getOpencodeModels(item: {
    projectId: string;
    openaiApiKey?: string;
    anthropicApiKey?: string;
    zenApiKey?: string;
    enableLoadFromCache: boolean;
    forceLoadFromCache: boolean;
  }): Promise<SessionModelApi[]> {
    let {
      projectId,
      openaiApiKey,
      anthropicApiKey,
      zenApiKey,
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

    let models = await this.fetchAndTransform({
      openaiApiKey: openaiApiKey,
      anthropicApiKey: anthropicApiKey,
      zenApiKey: zenApiKey
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
        providerModelsOpencode: true,
        providerModelsOpencodeTs: true
      }
    });

    if (!row) {
      return undefined;
    }

    let providerModelsOpencode = row.providerModelsOpencode;
    let providerModelsOpencodeTs = row.providerModelsOpencodeTs;

    let hasModels =
      isDefined(providerModelsOpencode) && providerModelsOpencode.length > 0;

    let hasTs = isDefined(providerModelsOpencodeTs);

    if (ignoreTtl) {
      if (hasModels && hasTs) {
        return providerModelsOpencode;
      }
      return undefined;
    }

    let isFresh =
      hasTs && Date.now() - providerModelsOpencodeTs < this.MODELS_DEV_TTL_MS;

    if (hasModels && isFresh) {
      return providerModelsOpencode;
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
        sql`UPDATE projects SET provider_models_opencode = ${modelsJson}::json, provider_models_opencode_ts = ${nowMs} WHERE project_id = ${projectId}`
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

  private async fetchAndTransform(item: {
    openaiApiKey?: string;
    anthropicApiKey?: string;
    zenApiKey?: string;
  }): Promise<SessionModelApi[]> {
    let { openaiApiKey, anthropicApiKey, zenApiKey } = item;

    let response = await fetch('https://models.dev/api.json', {
      signal: AbortSignal.timeout(10_000)
    });

    let modelsDevResponse = (await response.json()) as ModelsDevResponse;

    let includeProviders = new Set<string>();

    if (openaiApiKey) {
      includeProviders.add('openai');
    }
    if (anthropicApiKey) {
      includeProviders.add('anthropic');
    }
    // if (zenApiKey) {
    //   includeProviders.add('opencode');
    // }

    let allowedMap = new Map(
      MODEL_PROVIDERS.map(p => [p.provider_id, p.label])
    );

    let models: SessionModelApi[] = [];

    Object.entries(modelsDevResponse).forEach(([providerId, mdProvider]) => {
      let label = allowedMap.get(providerId);
      let isAllowed = label !== undefined;
      let isIncluded = includeProviders.has(providerId);

      if (isAllowed && isIncluded) {
        let transformed = fromModelsDevProvider(mdProvider);

        Object.values(transformed.models).forEach(model => {
          let isExcluded =
            model.status === 'deprecated' || model.status === 'alpha';

          if (!isExcluded) {
            let variantNames =
              model.variants && Object.keys(model.variants).length > 0
                ? Object.keys(model.variants)
                : undefined;

            models.push({
              id: model.id,
              name: model.name,
              providerId: providerId,
              providerName: label,
              variants: variantNames,
              contextLimit: model.limit?.context
            });
          }
        });
      }
    });

    return models;
  }
}
