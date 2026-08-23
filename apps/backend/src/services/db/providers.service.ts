import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { ProviderTab } from '#backend/drizzle/postgres/schema/_tabs';
import { providersTable } from '#backend/drizzle/postgres/schema/providers';
import {
  ANTHROPIC_PROVIDER_ID,
  CODEX_PROVIDER_ID,
  OPENAI_PROVIDER_ID,
  PROVIDER_NAME_BY_ID,
  PROVIDER_TYPE_BY_ID,
  RESERVED_PROVIDER_IDS
} from '#common/constants/providers';
import { ErEnum } from '#common/enums/er.enum';
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined';
import { ServerError } from '#common/models/server-error';
import type { LlmModel } from '#common/zod/backend/llm-models/llm-model';
import type { Provider } from '#common/zod/backend/provider';
import type { ProviderOptionsAnthropic } from '#common/zod/backend/provider-options/provider-options-anthropic';
import type { ProviderOptionsCodex } from '#common/zod/backend/provider-options/provider-options-codex';
import type { ProviderOptionsOpenAI } from '#common/zod/backend/provider-options/provider-options-openai';
import type { ProviderOptionsOpenAICompatible } from '#common/zod/backend/provider-options/provider-options-openai-compatible';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class ProvidersService {
  constructor(
    private hashService: HashService,
    private tabService: TabService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  makeProvider(
    item: {
      projectId: string;
      providerId: string;
      isEnabled: boolean;
      models: LlmModel[];
    } & (
      | {
          type: ProviderTypeEnum.OpenAI;
          options: ProviderOptionsOpenAI;
        }
      | {
          type: ProviderTypeEnum.Anthropic;
          options: ProviderOptionsAnthropic;
        }
      | {
          type: ProviderTypeEnum.OpenAICompatible;
          name: string;
          options: ProviderOptionsOpenAICompatible;
        }
      | {
          type: ProviderTypeEnum.OpenAICodex;
          options: ProviderOptionsCodex;
        }
    )
  ): ProviderTab {
    let expectedProviderType = PROVIDER_TYPE_BY_ID[item.providerId];

    let isInvalidBuiltIn =
      item.type !== ProviderTypeEnum.OpenAICompatible &&
      expectedProviderType !== item.type;

    let isReservedCompatible =
      item.type === ProviderTypeEnum.OpenAICompatible &&
      RESERVED_PROVIDER_IDS.includes(item.providerId);

    if (isInvalidBuiltIn || isReservedCompatible) {
      throw new ServerError({
        message: ErEnum.BACKEND_PROVIDER_TYPE_MISMATCH
      });
    }

    let common: Omit<ProviderTab, 'type' | 'options'> = {
      providerFullId: this.hashService.makeProviderFullId({
        projectId: item.projectId,
        providerId: item.providerId
      }),
      projectId: item.projectId,
      providerId: item.providerId,
      name:
        item.type === ProviderTypeEnum.OpenAICompatible
          ? item.name
          : PROVIDER_NAME_BY_ID[item.providerId],
      isEnabled: item.isEnabled,
      models: item.models,
      keyTag: undefined,
      serverTs: undefined,
      emptyData: undefined
    };

    let provider: ProviderTab =
      item.type === ProviderTypeEnum.OpenAI
        ? { ...common, type: item.type, options: item.options }
        : item.type === ProviderTypeEnum.Anthropic
          ? { ...common, type: item.type, options: item.options }
          : item.type === ProviderTypeEnum.OpenAICodex
            ? { ...common, type: item.type, options: item.options }
            : { ...common, type: item.type, options: item.options };

    return provider;
  }

  tabToApiProvider(item: {
    provider: ProviderTab;
    isIncludePasswords: boolean;
  }): Provider {
    let { provider, isIncludePasswords } = item;

    let models = provider.models.map(model => ({
      modelId: model.modelId,
      name: model.name,
      isManual: model.isManual,
      catalogName: model.catalogName,
      providerModelInfo: model.providerModelInfo,
      modelsDevStatus: model.modelsDevStatus,
      contextLimit: model.contextLimit,
      inputLimit: model.inputLimit,
      outputLimit: model.outputLimit,
      codexContextWindow: model.codexContextWindow,
      codexMaxContextWindow: model.codexMaxContextWindow,
      variants: model.variants,
      isOpencodeSupported: model.isOpencodeSupported,
      isExplorer: model.isExplorer,
      isBuilder: model.isBuilder,
      refreshedTs: model.refreshedTs
    }));

    let common = {
      projectId: provider.projectId,
      providerId: provider.providerId,
      name:
        provider.type === ProviderTypeEnum.OpenAICompatible
          ? provider.name
          : PROVIDER_NAME_BY_ID[provider.providerId],
      isEnabled: provider.isEnabled,
      models: models,
      serverTs: provider.serverTs
    };

    if (provider.type === ProviderTypeEnum.OpenAICodex) {
      return {
        ...common,
        providerId: CODEX_PROVIDER_ID,
        type: provider.type,
        options: {}
      };
    }

    let apiKey =
      isIncludePasswords === true
        ? provider.options.apiKey
        : isDefined(provider.options.apiKey)
          ? ''
          : undefined;

    if (provider.type === ProviderTypeEnum.OpenAICompatible) {
      let headers = isDefined(provider.options.headers)
        ? provider.options.headers.map(header => ({
            key: header.key,
            value: isIncludePasswords === true ? header.value : ''
          }))
        : undefined;

      let queryParams = isDefined(provider.options.queryParams)
        ? provider.options.queryParams.map(queryParam => ({
            key: queryParam.key,
            value: isIncludePasswords === true ? queryParam.value : ''
          }))
        : undefined;

      return {
        ...common,
        type: provider.type,
        options: {
          baseURL: provider.options.baseURL,
          apiKey: apiKey,
          headers: headers,
          queryParams: queryParams
        }
      };
    }

    if (provider.type === ProviderTypeEnum.OpenAI) {
      return {
        ...common,
        providerId: OPENAI_PROVIDER_ID,
        type: provider.type,
        options: {
          apiKey: apiKey
        }
      };
    }

    return {
      ...common,
      providerId: ANTHROPIC_PROVIDER_ID,
      type: provider.type,
      options: {
        apiKey: apiKey
      }
    };
  }

  async checkProviderDoesNotExist(item: {
    projectId: string;
    providerId: string;
  }) {
    let { projectId, providerId } = item;
    let provider = await this.db.drizzle.query.providersTable.findFirst({
      where: and(
        eq(providersTable.projectId, projectId),
        eq(providersTable.providerId, providerId)
      )
    });

    if (isDefined(provider)) {
      throw new ServerError({
        message: ErEnum.BACKEND_PROVIDER_ALREADY_EXISTS
      });
    }
  }

  async getProviderCheckExists(item: {
    projectId: string;
    providerId: string;
  }): Promise<ProviderTab> {
    let { projectId, providerId } = item;
    let provider = await this.db.drizzle.query.providersTable
      .findFirst({
        where: and(
          eq(providersTable.projectId, projectId),
          eq(providersTable.providerId, providerId)
        )
      })
      .then(providerEnt =>
        this.tabService.providerEntToTab({ providerEnt: providerEnt })
      );

    if (isUndefined(provider)) {
      throw new ServerError({
        message: ErEnum.BACKEND_PROVIDER_DOES_NOT_EXIST
      });
    }

    return provider;
  }

  async getEnabledProviders(item: {
    projectId: string;
  }): Promise<ProviderTab[]> {
    let { projectId } = item;
    return await this.db.drizzle.query.providersTable
      .findMany({
        where: and(
          eq(providersTable.projectId, projectId),
          eq(providersTable.isEnabled, true)
        )
      })
      .then(providerEnts =>
        providerEnts.map(providerEnt =>
          this.tabService.providerEntToTab({ providerEnt: providerEnt })
        )
      );
  }

  async getEnabledProviderCheckExists(item: {
    projectId: string;
    providerId: string;
  }): Promise<ProviderTab> {
    let provider = await this.getProviderCheckExists({
      projectId: item.projectId,
      providerId: item.providerId
    });

    if (provider.isEnabled === false) {
      throw new ServerError({
        message: ErEnum.BACKEND_PROVIDER_IS_DISABLED
      });
    }

    return provider;
  }

  async getModelSelection(item: {
    projectId: string;
    providerId: string;
    modelId: string;
    isUserCodexAuthSet: boolean;
    isBuilder: boolean;
  }) {
    let provider = await this.getEnabledProviderCheckExists({
      projectId: item.projectId,
      providerId: item.providerId
    });

    let model = this.getModelCheckExists({
      provider: provider,
      modelId: item.modelId
    });

    if (provider.type === ProviderTypeEnum.OpenAICodex) {
      if (item.isUserCodexAuthSet === false) {
        throw new ServerError({
          message: ErEnum.BACKEND_USER_PROFILE_CODEX_AUTH_NOT_SET
        });
      }
    } else if (provider.type !== ProviderTypeEnum.OpenAICompatible) {
      let isApiKeySet = isDefinedAndNotEmpty(provider.options.apiKey);
      if (isApiKeySet === false) {
        throw new ServerError({
          message: ErEnum.BACKEND_PROVIDER_API_KEY_REQUIRED
        });
      }
    }

    if (item.isBuilder === true) {
      if (model.isOpencodeSupported === false || model.isBuilder === false) {
        throw new ServerError({
          message: ErEnum.BACKEND_PROVIDER_MODEL_NOT_AVAILABLE_IN_BUILDER
        });
      }
    } else if (model.isExplorer === false) {
      throw new ServerError({
        message: ErEnum.BACKEND_PROVIDER_MODEL_NOT_AVAILABLE_IN_EXPLORER
      });
    }

    return { provider: provider, model: model };
  }

  checkModelDoesNotExist(item: { provider: ProviderTab; modelId: string }) {
    let { provider, modelId } = item;

    let model = provider.models.find(x => x.modelId === modelId);

    if (isDefined(model)) {
      throw new ServerError({
        message: ErEnum.BACKEND_PROVIDER_MODEL_ALREADY_EXISTS
      });
    }
  }

  getModelCheckExists(item: { provider: ProviderTab; modelId: string }) {
    let { provider, modelId } = item;

    let model = provider.models.find(x => x.modelId === modelId);

    if (isUndefined(model)) {
      throw new ServerError({
        message: ErEnum.BACKEND_PROVIDER_MODEL_DOES_NOT_EXIST
      });
    }

    return model;
  }
}
