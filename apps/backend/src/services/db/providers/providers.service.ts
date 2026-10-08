import { Inject, Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { ProviderTab } from '#backend/drizzle/postgres/schema/_tabs';
import {
  type ProviderEnt,
  providersTable
} from '#backend/drizzle/postgres/schema/providers';
import { HashService } from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import {
  ANTHROPIC_PROVIDER_ID,
  CODEX_PROVIDER_ID,
  OPENAI_PROVIDER_ID,
  PROVIDER_NAME_BY_ID,
  PROVIDER_TYPE_BY_ID,
  RESERVED_PROVIDER_IDS
} from '#common/constants/providers';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { CheckProviderDoesNotExistResultError } from '#common/types/backend/function-errors/check-provider-does-not-exist-result-error';
import type { GetProviderCheckExistsResultError } from '#common/types/backend/function-errors/get-provider-check-exists-result-error';
import type { MakeProviderResultError } from '#common/types/backend/function-errors/make-provider-result-error';
import type { LlmModel } from '#common/types/backend/parts/llm-models/llm-model';
import type { LlmModelVariant } from '#common/types/backend/parts/llm-models/llm-model-variant';
import type { ProviderOptionsAnthropic } from '#common/types/backend/parts/provider/options/provider-options-anthropic';
import type { ProviderOptionsCodex } from '#common/types/backend/parts/provider/options/provider-options-codex';
import type { ProviderOptionsOpenAI } from '#common/types/backend/parts/provider/options/provider-options-openai';
import type { ProviderOptionsOpenAICompatible } from '#common/types/backend/parts/provider/options/provider-options-openai-compatible';
import type { Provider } from '#common/types/backend/parts/provider/provider';
import type { ProviderType } from '#common/types/backend/parts/provider/provider-type';

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
          type: 'OpenAI';
          options: ProviderOptionsOpenAI;
        }
      | {
          type: 'Anthropic';
          options: ProviderOptionsAnthropic;
        }
      | {
          type: 'OpenAICompatible';
          name: string;
          options: ProviderOptionsOpenAICompatible;
        }
      | {
          type: 'OpenAICodex';
          options: ProviderOptionsCodex;
        }
    )
  ): ProviderTab {
    let result: Result.Result<ProviderTab, MakeProviderResultError> =
      this.makeProviderResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let provider: ProviderTab = result.value;

    return provider;
  }

  makeProviderResult(
    item: {
      projectId: string;
      providerId: string;
      isEnabled: boolean;
      models: LlmModel[];
    } & (
      | {
          type: 'OpenAI';
          options: ProviderOptionsOpenAI;
        }
      | {
          type: 'Anthropic';
          options: ProviderOptionsAnthropic;
        }
      | {
          type: 'OpenAICompatible';
          name: string;
          options: ProviderOptionsOpenAICompatible;
        }
      | {
          type: 'OpenAICodex';
          options: ProviderOptionsCodex;
        }
    )
  ): Result.Result<ProviderTab, MakeProviderResultError> {
    let { projectId, providerId, isEnabled, models } = item;

    let expectedProviderType: ProviderType = PROVIDER_TYPE_BY_ID[providerId];

    let isInvalidBuiltIn =
      item.type !== 'OpenAICompatible' && expectedProviderType !== item.type;

    let isReservedProviderId: boolean =
      RESERVED_PROVIDER_IDS.includes(providerId);

    let isReservedCompatible =
      item.type === 'OpenAICompatible' && isReservedProviderId;

    if (isInvalidBuiltIn || isReservedCompatible) {
      return Result.fail({ code: 'BACKEND_PROVIDER_TYPE_MISMATCH' });
    }

    let common: Omit<ProviderTab, 'type' | 'options'> = {
      providerFullId: this.hashService.makeProviderFullId({
        projectId: projectId,
        providerId: providerId
      }),
      projectId: projectId,
      providerId: providerId,
      name:
        item.type === 'OpenAICompatible'
          ? item.name
          : PROVIDER_NAME_BY_ID[providerId],
      isEnabled: isEnabled,
      models: models,
      keyTag: undefined,
      serverTs: undefined,
      emptyData: undefined
    };

    let provider: ProviderTab =
      item.type === 'OpenAI'
        ? { type: item.type, ...common, options: item.options }
        : item.type === 'Anthropic'
          ? { type: item.type, ...common, options: item.options }
          : item.type === 'OpenAICodex'
            ? { type: item.type, ...common, options: item.options }
            : { type: item.type, ...common, options: item.options };

    return Result.succeed(provider);
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
        provider.type === 'OpenAICompatible'
          ? provider.name
          : PROVIDER_NAME_BY_ID[provider.providerId],
      isEnabled: provider.isEnabled,
      models: models,
      serverTs: provider.serverTs
    };

    if (provider.type === 'OpenAICodex') {
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

    if (provider.type === 'OpenAICompatible') {
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

    if (provider.type === 'OpenAI') {
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
  }): Promise<void> {
    let result: Result.Result<void, CheckProviderDoesNotExistResultError> =
      await this.checkProviderDoesNotExistResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }
  }

  async checkProviderDoesNotExistResult(item: {
    projectId: string;
    providerId: string;
  }): Result.ResultAsync<void, CheckProviderDoesNotExistResultError> {
    let { projectId, providerId } = item;

    let providerEnt: ProviderEnt =
      await this.db.drizzle.query.providersTable.findFirst({
        where: and(
          eq(providersTable.projectId, projectId),
          eq(providersTable.providerId, providerId)
        )
      });

    return isDefined(providerEnt)
      ? Result.fail({ code: 'BACKEND_PROVIDER_ALREADY_EXISTS' })
      : Result.succeed();
  }

  async getProviderCheckExists(item: {
    projectId: string;
    providerId: string;
  }): Promise<ProviderTab> {
    let result: Result.Result<ProviderTab, GetProviderCheckExistsResultError> =
      await this.getProviderCheckExistsResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let provider: ProviderTab = result.value;

    return provider;
  }

  async getProviderCheckExistsResult(item: {
    projectId: string;
    providerId: string;
  }): Result.ResultAsync<ProviderTab, GetProviderCheckExistsResultError> {
    let { projectId, providerId } = item;

    return this.db.drizzle.query.providersTable
      .findFirst({
        where: and(
          eq(providersTable.projectId, projectId),
          eq(providersTable.providerId, providerId)
        )
      })
      .then((providerEnt: ProviderEnt) =>
        isUndefined(providerEnt)
          ? Result.fail({ code: 'BACKEND_PROVIDER_DOES_NOT_EXIST' })
          : this.tabService.providerEntToTabResult({ providerEnt: providerEnt })
      );
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
        message: 'BACKEND_PROVIDER_IS_DISABLED'
      });
    }

    return provider;
  }

  async getModelSelection(item: {
    projectId: string;
    providerId: string;
    modelId: string;
    variant?: string;
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

    if (provider.type === 'OpenAICodex') {
      if (item.isUserCodexAuthSet === false) {
        throw new ServerError({
          message: 'BACKEND_USER_PROFILE_CODEX_AUTH_NOT_SET'
        });
      }
    } else if (provider.type !== 'OpenAICompatible') {
      let isApiKeySet = isDefinedAndNotEmpty(provider.options.apiKey);
      if (isApiKeySet === false) {
        throw new ServerError({
          message: 'BACKEND_PROVIDER_API_KEY_REQUIRED'
        });
      }
    }

    if (item.isBuilder === true) {
      if (model.isOpencodeSupported === false || model.isBuilder === false) {
        throw new ServerError({
          message: 'BACKEND_PROVIDER_MODEL_NOT_AVAILABLE_IN_BUILDER'
        });
      }
    } else if (model.isExplorer === false) {
      throw new ServerError({
        message: 'BACKEND_PROVIDER_MODEL_NOT_AVAILABLE_IN_EXPLORER'
      });
    }

    if (!isDefined(item.variant)) {
      throw new ServerError({
        message: 'BACKEND_MESSAGE_VARIANT_REQUIRED'
      });
    }

    let matchingModelVariants: LlmModelVariant[] = model.variants.filter(
      variant => variant.variant === item.variant
    );

    let isVariantAvailable: boolean =
      isDefined(matchingModelVariants[0]) &&
      (item.isBuilder === true
        ? matchingModelVariants[0].isBuilder
        : matchingModelVariants[0].isExplorer);

    if (isVariantAvailable === false) {
      throw new ServerError({
        message: 'BACKEND_PROVIDER_MODEL_VARIANT_NOT_AVAILABLE'
      });
    }

    return { provider: provider, model: model };
  }

  checkModelDoesNotExist(item: { provider: ProviderTab; modelId: string }) {
    let { provider, modelId } = item;

    let model = provider.models.find(x => x.modelId === modelId);

    if (isDefined(model)) {
      throw new ServerError({
        message: 'BACKEND_PROVIDER_MODEL_ALREADY_EXISTS'
      });
    }
  }

  getModelCheckExists(item: { provider: ProviderTab; modelId: string }) {
    let { provider, modelId } = item;

    let model = provider.models.find(x => x.modelId === modelId);

    if (isUndefined(model)) {
      throw new ServerError({
        message: 'BACKEND_PROVIDER_MODEL_DOES_NOT_EXIST'
      });
    }

    return model;
  }
}
