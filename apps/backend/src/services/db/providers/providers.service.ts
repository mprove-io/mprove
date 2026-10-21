import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { ProviderTab } from '#backend/drizzle/postgres/schema/_tabs';
import { providersTable } from '#backend/drizzle/postgres/schema/providers';
import { DbService } from '#backend/services/db/db.service';
import { HashService } from '#backend/services/hash/hash.service';
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
import type { CheckLlmModelDoesNotExistError } from '#common/types/backend/function-errors/check-llm-model-does-not-exist-error';
import type { CheckProviderDoesNotExistError } from '#common/types/backend/function-errors/check-provider-does-not-exist-error';
import type { GetEnabledProviderCheckExistsError } from '#common/types/backend/function-errors/get-enabled-provider-check-exists-error';
import type { GetLlmModelCheckExistsError } from '#common/types/backend/function-errors/get-llm-model-check-exists-error';
import type { GetModelSelectionError } from '#common/types/backend/function-errors/get-model-selection-error';
import type { MakeProviderError } from '#common/types/backend/function-errors/make-provider-error';
import type { LlmModel } from '#common/types/backend/parts/llm-models/llm-model';
import type { ProviderOptionsAnthropic } from '#common/types/backend/parts/provider/options/provider-options-anthropic';
import type { ProviderOptionsCodex } from '#common/types/backend/parts/provider/options/provider-options-codex';
import type { ProviderOptionsOpenAI } from '#common/types/backend/parts/provider/options/provider-options-openai';
import type { ProviderOptionsOpenAICompatible } from '#common/types/backend/parts/provider/options/provider-options-openai-compatible';
import type { Provider } from '#common/types/backend/parts/provider/provider';
import type { ProviderType } from '#common/types/backend/parts/provider/provider-type';

export type GetModelSelectionOutput = {
  provider: ProviderTab;
  model: LlmModel;
};

@Injectable()
export class ProvidersService {
  constructor(
    private hashService: HashService,
    private db: DbService
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
  ): Result.Result<ProviderTab, MakeProviderError> {
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
  }): Result.ResultAsync<void, CheckProviderDoesNotExistError> {
    let { projectId, providerId } = item;

    let isProviderExist: boolean = await this.db.providers.isExistUnwrap({
      where: and(
        eq(providersTable.projectId, projectId),
        eq(providersTable.providerId, providerId)
      )
    });

    return isProviderExist
      ? Result.fail({ code: 'BACKEND_PROVIDER_ALREADY_EXISTS' })
      : Result.succeed();
  }

  async getEnabledProviderCheckExists(item: {
    projectId: string;
    providerId: string;
  }): Result.ResultAsync<ProviderTab, GetEnabledProviderCheckExistsError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind('provider', v =>
        this.db.providers.findFirstCheckExists({
          where: and(
            eq(providersTable.projectId, v.projectId),
            eq(providersTable.providerId, v.providerId)
          )
        })
      ),
      Result.andThrough(v =>
        v.provider.isEnabled === false
          ? Result.fail({ code: 'BACKEND_PROVIDER_IS_DISABLED' })
          : Result.succeed()
      ),
      Result.map((v): ProviderTab => v.provider)
    );
  }

  async getModelSelection(item: {
    projectId: string;
    providerId: string;
    modelId: string;
    variant?: string;
    isUserCodexAuthSet: boolean;
    isBuilder: boolean;
  }): Result.ResultAsync<GetModelSelectionOutput, GetModelSelectionError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind('provider', v =>
        this.getEnabledProviderCheckExists({
          projectId: v.projectId,
          providerId: v.providerId
        })
      ),
      Result.bind('model', v =>
        this.getLlmModelCheckExists({
          provider: v.provider,
          modelId: v.modelId
        })
      ),
      Result.andThrough(v => {
        if (v.provider.type === 'OpenAICodex') {
          if (v.isUserCodexAuthSet === false) {
            return Result.fail({
              code: 'BACKEND_USER_PROFILE_CODEX_AUTH_NOT_SET'
            });
          }
        } else if (
          v.provider.type !== 'OpenAICompatible' &&
          isDefinedAndNotEmpty(v.provider.options.apiKey) === false
        ) {
          return Result.fail({ code: 'BACKEND_PROVIDER_API_KEY_REQUIRED' });
        }

        return Result.succeed();
      }),
      Result.andThrough(v => {
        if (v.isBuilder === true) {
          if (
            v.model.isOpencodeSupported === false ||
            v.model.isBuilder === false
          ) {
            return Result.fail({
              code: 'BACKEND_LLM_MODEL_NOT_AVAILABLE_IN_BUILDER'
            });
          }
        } else if (v.model.isExplorer === false) {
          return Result.fail({
            code: 'BACKEND_LLM_MODEL_NOT_AVAILABLE_IN_EXPLORER'
          });
        }

        return Result.succeed();
      }),
      Result.andThrough(v =>
        isUndefined(v.variant)
          ? Result.fail({ code: 'BACKEND_MESSAGE_VARIANT_REQUIRED' })
          : Result.succeed()
      ),
      Result.bind('matchingModelVariants', v =>
        Result.succeed(
          v.model.variants.filter(variant => variant.variant === v.variant)
        )
      ),
      Result.andThrough(v => {
        let isVariantAvailable: boolean =
          isDefined(v.matchingModelVariants[0]) &&
          (v.isBuilder === true
            ? v.matchingModelVariants[0].isBuilder
            : v.matchingModelVariants[0].isExplorer);

        return isVariantAvailable
          ? Result.succeed()
          : Result.fail({ code: 'BACKEND_LLM_MODEL_VARIANT_NOT_AVAILABLE' });
      }),
      Result.map(
        (v): GetModelSelectionOutput => ({
          provider: v.provider,
          model: v.model
        })
      )
    );
  }

  checkLlmModelDoesNotExist(item: {
    provider: ProviderTab;
    modelId: string;
  }): Result.Result<void, CheckLlmModelDoesNotExistError> {
    let { provider, modelId } = item;

    if (provider.models.some(model => model.modelId === modelId)) {
      return Result.fail({ code: 'BACKEND_LLM_MODEL_ALREADY_EXISTS' });
    }

    return Result.succeed();
  }

  getLlmModelCheckExists(item: {
    provider: ProviderTab;
    modelId: string;
  }): Result.Result<LlmModel, GetLlmModelCheckExistsError> {
    let { provider, modelId } = item;

    let model: LlmModel = provider.models.find(
      model => model.modelId === modelId
    );

    if (isUndefined(model)) {
      return Result.fail({ code: 'BACKEND_LLM_MODEL_DOES_NOT_EXIST' });
    }

    return Result.succeed(model);
  }
}
