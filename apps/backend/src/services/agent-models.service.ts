import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createOpencodeClient,
  type ProviderListResponse
} from '@opencode-ai/sdk';
import { BackendConfig } from '#backend/config/backend-config';
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

      for (let provider of providerListResp.data.all) {
        let models: AgentModelApi[] = [];

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
            providerName: provider.name,
            variants: variantNames
          });
        }

        this.providerModels.set(provider.id, models);
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

  async getModelsForProvider(providerId: string): Promise<AgentModelApi[]> {
    if (!this.loadPromise) {
      this.loadPromise = this.loadModels();
    }
    await this.loadPromise;

    return this.providerModels.get(providerId);
  }
}
