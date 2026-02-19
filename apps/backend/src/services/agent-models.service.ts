import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createOpencodeClient,
  type OpencodeClient,
  type ProviderListResponse
} from '@opencode-ai/sdk';
import { BackendConfig } from '#backend/config/backend-config';
import { MODEL_PROVIDERS } from '#common/constants/top-backend';
import { AgentModelApi } from '#common/interfaces/backend/agent-model-api';

// Extends SDK model type with variants (present in response but missing from generated types)
type OcModel = ProviderListResponse['all'][number]['models'][string] & {
  variants?: Record<string, Record<string, unknown>>;
};

@Injectable()
export class AgentModelsService {
  private providerModels = new Map<string, AgentModelApi[]>();
  private loadPromise: Promise<void> | undefined;

  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
  ) {}

  private mapProviderModels(
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

  async loadModels() {
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

      this.providerModels.clear();
      for (let model of models) {
        let list = this.providerModels.get(model.providerId) ?? [];
        list.push(model);
        this.providerModels.set(model.providerId, list);
      }

      console.log(
        `[agent-models] cached models for ${this.providerModels.size} providers in ${Date.now() - startMs}ms`
      );
    } catch (e: any) {
      console.log(
        `[agent-models] failed to cache provider models: ${e?.message}`
      );
    }
  }

  async getModelsFromClient(client: OpencodeClient): Promise<AgentModelApi[]> {
    let { data } = await client.provider.list({ throwOnError: true });
    return this.mapProviderModels(data.all);
  }

  async getModels(item: { getFromCache: boolean }): Promise<AgentModelApi[]> {
    if (item.getFromCache && this.providerModels.size > 0) {
      return [...this.providerModels.values()].flat();
    }

    this.loadPromise = this.loadModels();
    await this.loadPromise;

    return [...this.providerModels.values()].flat();
  }
}
