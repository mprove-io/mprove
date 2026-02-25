import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createOpencodeClient,
  type ProviderListResponse
} from '@opencode-ai/sdk/v2';
import retry from 'async-retry';
import { isNotNull } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import { uconfigsTable } from '#backend/drizzle/postgres/schema/uconfigs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { MODEL_PROVIDERS } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { AgentModelApi } from '#common/interfaces/backend/agent-model-api';
import { ServerError } from '#common/models/server-error';
import { TabService } from './tab.service';

// Extends SDK model type with variants (present in response but missing from generated types)
type OcModel = ProviderListResponse['all'][number]['models'][string] & {
  variants?: Record<string, Record<string, unknown>>;
};

@Injectable()
export class AgentModelsService {
  constructor(
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async loadSharedModels(): Promise<AgentModelApi[]> {
    let startMs = Date.now();

    try {
      let opencodeServerPassword = this.cs.get<
        BackendConfig['opencodeServerPassword']
      >('opencodeServerPassword');

      let opencodeServerUrl =
        this.cs.get<BackendConfig['opencodeServerUrl']>('opencodeServerUrl');

      let client = createOpencodeClient({
        baseUrl: opencodeServerUrl,
        headers: {
          Authorization: `Basic ${Buffer.from(`opencode:${opencodeServerPassword}`).toString('base64')}`
        }
      });

      let providerListResp = await client.provider.list();

      let models = this.mapProviderModels(providerListResp.data.all);

      let uconfig = await this.db.drizzle.query.uconfigsTable
        .findFirst({
          where: isNotNull(uconfigsTable.uconfigId)
        })
        .then(x => this.tabService.uconfigEntToTab(x));

      uconfig.providerModels = models;

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                update: {
                  uconfigs: [uconfig]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );

      // console.log(
      //   `[agent-models] cached ${models.length} models in ${Date.now() - startMs}ms`
      // );

      return models;
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

      return [];
    }
  }

  mapProviderModels(
    allProviders: ProviderListResponse['all']
  ): AgentModelApi[] {
    let allowedMap = new Map(
      MODEL_PROVIDERS.map(p => [p.provider_id, p.label])
    );
    let models: AgentModelApi[] = [];

    for (let provider of allProviders) {
      let label = allowedMap.get(provider.id);
      if (label === undefined) {
        continue;
      }

      for (let value of Object.values(provider.models)) {
        let model = value as OcModel;
        let variantNames =
          model.variants && Object.keys(model.variants).length > 0
            ? Object.keys(model.variants)
            : undefined;

        models.push({
          id: model.id,
          name: model.name,
          providerId: provider.id,
          providerName: label,
          variants: variantNames
        });
      }
    }

    return models;
  }
}
