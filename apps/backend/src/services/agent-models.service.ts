import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '#backend/config/backend-config';
import { BackendEnvEnum } from '#common/enums/env/backend-env.enum';
import { AgentModelApi } from '#common/interfaces/backend/agent-model-api';

const MODELS_DEV_URL = 'https://models.dev/api.json';

const SUPPORTED_PROVIDERS = ['opencode', 'openai', 'anthropic'];

@Injectable()
export class AgentModelsService implements OnModuleInit {
  private providerModels = new Map<string, AgentModelApi[]>();

  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
  ) {}

  async onModuleInit() {
    let backendEnv = this.cs.get<BackendConfig['backendEnv']>('backendEnv');

    if (backendEnv === BackendEnvEnum.TEST) {
      return;
    }

    await this.loadModels();
  }

  async loadModels() {
    try {
      let response = await fetch(MODELS_DEV_URL);
      let data: Record<
        string,
        {
          id: string;
          name: string;
          models: Record<string, { id: string; name: string }>;
        }
      > = await response.json();

      for (let providerId of SUPPORTED_PROVIDERS) {
        let provider = data[providerId];
        if (!provider) {
          continue;
        }

        let models: AgentModelApi[] = [];

        for (let modelKey of Object.keys(provider.models)) {
          let model = provider.models[modelKey];
          models.push({
            id: model.id,
            name: model.name,
            providerId: provider.id,
            providerName: provider.name
          });
        }

        this.providerModels.set(provider.id, models);
      }

      this.logger.log(
        `[agent-models] cached models for ${this.providerModels.size} providers`
      );
    } catch (e: any) {
      this.logger.warn(
        `[agent-models] failed to cache provider models: ${e?.message}`
      );
    }
  }

  getModelsForProvider(providerId: string): AgentModelApi[] {
    return this.providerModels.get(providerId) || [];
  }
}
