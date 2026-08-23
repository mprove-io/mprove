import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { getAnthropicModelVariants } from '#backend/functions/anthropic-model-variants';
import {
  type CodexModelsResult,
  CodexService
} from '#backend/services/codex.service';
import { OPENAI_PROVIDER_ID } from '#common/constants/providers';
import { CODEX_ALLOWED_MODELS_EDITOR } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import { ServerError } from '#common/models/server-error';
import type { AnthropicModel } from '#common/zod/backend/anthropic-model';
import {
  type AnthropicModelsResponse,
  zAnthropicModelsResponse
} from '#common/zod/backend/anthropic-models-response';
import type { CodexModel } from '#common/zod/backend/codex-model';
import type { LlmModel } from '#common/zod/backend/llm-models/llm-model';
import type { LlmModelInput } from '#common/zod/backend/llm-models/llm-model-input';
import type { LlmModelPart } from '#common/zod/backend/llm-models/llm-model-part';
import type { DevModel } from '#common/zod/backend/models-dev/dev-model';
import {
  type DevProvider,
  type ModelsDevResponse,
  zDevProvider
} from '#common/zod/backend/models-dev/dev-provider';
import type { OpenAiModel } from '#common/zod/backend/openai-model';
import {
  type OpenAiModelsResponse,
  zOpenAiModelsResponse
} from '#common/zod/backend/openai-models-response';

export type LlmModelPartsResult = {
  modelParts: LlmModelPart[];
  errorMessage?: string;
};

@Injectable()
export class LlmModelService {
  private readonly modelsDevTtlMs = 60 * 60 * 1000;
  private modelsDev?: ModelsDevResponse;
  private modelsDevTs?: number;

  constructor(private codexService: CodexService) {}

  async refreshModel(item: {
    providerType: ProviderTypeEnum;
    apiKey?: string;
    userId?: string;
    isCodexAuthSet?: boolean;
    modelInput: LlmModelInput;
    isForceRefresh?: boolean;
  }): Promise<LlmModel> {
    let {
      providerType,
      apiKey,
      userId,
      isCodexAuthSet,
      modelInput,
      isForceRefresh
    } = item;

    let refreshedTs: number = Date.now();

    let isManualCodexModel: boolean =
      providerType === ProviderTypeEnum.OpenAICodex &&
      modelInput.isManual === true;

    let isManualModel: boolean =
      providerType === ProviderTypeEnum.OpenAICompatible || isManualCodexModel;

    if (isManualModel) {
      this.validateManualModelLimits({ modelInput: modelInput });
    }

    if (
      providerType === ProviderTypeEnum.OpenAICompatible ||
      isManualCodexModel
    ) {
      let isOpencodeSupported: boolean =
        providerType === ProviderTypeEnum.OpenAICompatible
          ? isModelSupportedByOpencode({ modelId: modelInput.modelId })
          : isCodexModelSupportedByOpencode({ modelId: modelInput.modelId });

      let model: LlmModel = {
        modelId: modelInput.modelId,
        name: modelInput.name,
        isManual: isManualCodexModel,
        catalogName: undefined,
        contextLimit: modelInput.contextLimit,
        inputLimit: modelInput.inputLimit,
        outputLimit: modelInput.outputLimit,
        variants: undefined,
        isOpencodeSupported: isOpencodeSupported,
        isExplorer: modelInput.isExplorer,
        isBuilder: modelInput.isBuilder,
        refreshedTs: refreshedTs
      };

      return model;
    }

    let modelPartsResult: LlmModelPartsResult = await this.getModelParts({
      providerType: providerType,
      apiKey: apiKey,
      userId: userId,
      isCodexAuthSet: isCodexAuthSet,
      isForceRefresh: isForceRefresh
    });

    let modelParts: LlmModelPart[] = modelPartsResult.modelParts;

    let modelPartIndex: number = modelParts.findIndex(
      modelPart => modelPart.modelId === modelInput.modelId
    );

    if (modelPartIndex < 0) {
      throw new ServerError({
        message: ErEnum.BACKEND_PROVIDER_MODEL_NOT_DISCOVERED
      });
    }

    let modelPart: LlmModelPart = modelParts[modelPartIndex];

    let model: LlmModel = {
      ...modelPart,
      name: modelInput.name,
      isManual: false,
      isExplorer: modelInput.isExplorer,
      isBuilder: modelInput.isBuilder,
      refreshedTs: refreshedTs
    };

    return model;
  }

  validateManualModelLimits(item: { modelInput: LlmModelInput }): void {
    let { modelInput } = item;

    if (!isDefined(modelInput.contextLimit)) {
      throw new ServerError({
        message: ErEnum.BACKEND_PROVIDER_MODEL_CONTEXT_LIMIT_REQUIRED
      });
    }

    let isInputLimitInvalid: boolean =
      isDefined(modelInput.inputLimit) &&
      modelInput.inputLimit > modelInput.contextLimit;

    let isOutputLimitInvalid: boolean =
      isDefined(modelInput.outputLimit) &&
      modelInput.outputLimit > modelInput.contextLimit;

    if (isInputLimitInvalid || isOutputLimitInvalid) {
      throw new ServerError({
        message: ErEnum.BACKEND_PROVIDER_MODEL_LIMIT_INVALID
      });
    }
  }

  async getModelParts(item: {
    providerType:
      | ProviderTypeEnum.OpenAI
      | ProviderTypeEnum.Anthropic
      | ProviderTypeEnum.OpenAICodex;
    apiKey?: string;
    userId?: string;
    isCodexAuthSet?: boolean;
    isForceRefresh?: boolean;
  }): Promise<LlmModelPartsResult> {
    let { providerType, apiKey, userId, isCodexAuthSet, isForceRefresh } = item;

    if (
      providerType !== ProviderTypeEnum.OpenAICodex &&
      !isDefinedAndNotEmpty(apiKey)
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_PROVIDER_API_KEY_REQUIRED
      });
    }

    if (providerType === ProviderTypeEnum.OpenAICodex) {
      let canGetCodexModels: boolean =
        isCodexAuthSet === true && isDefinedAndNotEmpty(userId);

      if (canGetCodexModels === false) {
        let result: LlmModelPartsResult = { modelParts: [] };

        return result;
      }

      let codexModelsResult: CodexModelsResult =
        await this.codexService.getModels({ userId: userId });

      if (isDefinedAndNotEmpty(codexModelsResult.errorMessage)) {
        let result: LlmModelPartsResult = {
          modelParts: [],
          errorMessage: codexModelsResult.errorMessage
        };

        return result;
      }

      let codexModelParts: LlmModelPart[] = codexModelsResult.codexModels.map(
        codexModel =>
          codexModelToLlmModelPart({
            codexModel: codexModel
          })
      );

      let result: LlmModelPartsResult = {
        modelParts: codexModelParts
      };

      return result;
    }

    if (providerType === ProviderTypeEnum.Anthropic) {
      let anthropicModelParts: LlmModelPart[] =
        await this.getAnthropicModelParts({ apiKey: apiKey as string });

      let result: LlmModelPartsResult = {
        modelParts: anthropicModelParts
      };

      return result;
    }

    let isModelsDevFresh: boolean =
      isForceRefresh !== true &&
      isDefinedAndNotEmpty(this.modelsDev) &&
      isDefinedAndNotEmpty(this.modelsDevTs) &&
      Date.now() - this.modelsDevTs < this.modelsDevTtlMs;

    let modelsDev: ModelsDevResponse;

    if (isModelsDevFresh) {
      modelsDev = this.modelsDev as ModelsDevResponse;
    } else {
      try {
        let response: Response = await fetch('https://models.dev/api.json', {
          signal: AbortSignal.timeout(10_000)
        });

        if (!response.ok) {
          throw new Error(`models.dev returned ${response.status}`);
        }

        let responseJson: unknown = await response.json();

        modelsDev = z.record(z.string(), zDevProvider).parse(responseJson);

        this.modelsDev = modelsDev;

        this.modelsDevTs = Date.now();
      } catch (error) {
        throw new ServerError({
          message: ErEnum.BACKEND_PROVIDER_MODEL_DISCOVERY_FAILED,
          originalError: error
        });
      }
    }

    let devProvider: DevProvider = modelsDev[OPENAI_PROVIDER_ID];

    if (!devProvider) {
      throw new ServerError({
        message: ErEnum.BACKEND_PROVIDER_MODEL_DISCOVERY_FAILED
      });
    }

    let devModels: DevModel[] = Object.values(devProvider.models);

    let openAiModelsById: Map<string, OpenAiModel> = new Map();

    try {
      let response: Response = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(10_000)
      });

      if (!response.ok) {
        let responseError: Error = new Error(
          `OpenAI returned ${response.status}`
        );

        if (response.status === 401) {
          throw new ServerError({
            message: ErEnum.BACKEND_PROVIDER_NOT_VALID_API_KEY,
            originalError: responseError
          });
        }

        throw responseError;
      }

      let responseJson: unknown = await response.json();

      let openAiResponse: OpenAiModelsResponse =
        zOpenAiModelsResponse.parse(responseJson);

      openAiModelsById = new Map(
        openAiResponse.data.map(model => [model.id, model])
      );
    } catch (error) {
      if (error instanceof ServerError) {
        throw error;
      }

      throw new ServerError({
        message: ErEnum.BACKEND_PROVIDER_MODEL_DISCOVERY_FAILED,
        originalError: error
      });
    }

    let modelParts: LlmModelPart[] = devModels
      .map(devModel =>
        openAiModelToLlmModelPart({
          devModel: devModel,
          devProvider: devProvider,
          openAiModel: openAiModelsById.get(devModel.id)
        })
      )
      .filter(isDefined);

    let result: LlmModelPartsResult = {
      modelParts: modelParts
    };

    return result;
  }

  private async getAnthropicModelParts(item: {
    apiKey: string;
  }): Promise<LlmModelPart[]> {
    let { apiKey } = item;

    let anthropicModels: AnthropicModel[] = [];

    let url: URL = new URL('https://api.anthropic.com/v1/models');

    url.searchParams.set('limit', '1000');

    let hasMore: boolean = true;

    try {
      while (hasMore) {
        let response: Response = await fetch(url, {
          headers: {
            'anthropic-version': '2023-06-01',
            'x-api-key': apiKey
          },
          signal: AbortSignal.timeout(10_000)
        });

        if (!response.ok) {
          let responseError: Error = new Error(
            `Anthropic returned ${response.status}`
          );

          if (response.status === 401) {
            throw new ServerError({
              message: ErEnum.BACKEND_PROVIDER_NOT_VALID_API_KEY,
              originalError: responseError
            });
          }

          throw responseError;
        }

        let responseJson: unknown = await response.json();

        let anthropicResponse: AnthropicModelsResponse =
          zAnthropicModelsResponse.parse(responseJson);

        anthropicModels.push(...anthropicResponse.data);

        hasMore = anthropicResponse.has_more;

        if (hasMore) {
          let hasLastId: boolean = isDefinedAndNotEmpty(
            anthropicResponse.last_id
          );

          if (!hasLastId) {
            throw new Error('Anthropic returned invalid pagination metadata');
          }

          url.searchParams.set('after_id', anthropicResponse.last_id as string);
        }
      }
    } catch (error) {
      if (error instanceof ServerError) {
        throw error;
      }

      throw new ServerError({
        message: ErEnum.BACKEND_PROVIDER_MODEL_DISCOVERY_FAILED,
        originalError: error
      });
    }

    let modelParts: LlmModelPart[] = anthropicModels.map(anthropicModel =>
      anthropicModelToLlmModelPart({ anthropicModel: anthropicModel })
    );

    return modelParts;
  }
}

function codexModelToLlmModelPart(item: {
  codexModel: CodexModel;
}): LlmModelPart {
  let { codexModel } = item;

  let isOpencodeSupported: boolean = isCodexModelSupportedByOpencode({
    modelId: codexModel.slug
  });

  let variants: string[] = (codexModel.supported_reasoning_levels ?? []).map(
    level => level.effort
  );

  let modelPart: LlmModelPart = {
    modelId: codexModel.slug,
    catalogName: codexModel.display_name,
    providerModelInfo: { ...codexModel },
    contextLimit: codexModel.context_window ?? codexModel.max_context_window,
    inputLimit: undefined,
    outputLimit: undefined,
    codexContextWindow: codexModel.context_window,
    codexMaxContextWindow: codexModel.max_context_window,
    variants: variants.length > 0 ? variants : undefined,
    isOpencodeSupported: isOpencodeSupported
  };

  return modelPart;
}

function anthropicModelToLlmModelPart(item: {
  anthropicModel: AnthropicModel;
}): LlmModelPart {
  let { anthropicModel } = item;

  let variants: string[] = getAnthropicModelVariants({
    anthropicModel: anthropicModel
  });

  let isOpencodeSupported: boolean = isModelSupportedByOpencode({
    modelId: anthropicModel.id
  });

  let modelPart: LlmModelPart = {
    modelId: anthropicModel.id,
    catalogName: anthropicModel.display_name,
    providerModelInfo: { ...anthropicModel },
    contextLimit: undefined,
    inputLimit:
      isDefined(anthropicModel.max_input_tokens) &&
      anthropicModel.max_input_tokens > 0
        ? anthropicModel.max_input_tokens
        : undefined,
    outputLimit:
      isDefined(anthropicModel.max_tokens) && anthropicModel.max_tokens > 0
        ? anthropicModel.max_tokens
        : undefined,
    variants: variants.length > 0 ? variants : undefined,
    isOpencodeSupported: isOpencodeSupported
  };

  return modelPart;
}

function openAiModelToLlmModelPart(item: {
  devModel: DevModel;
  devProvider: DevProvider;
  openAiModel?: OpenAiModel;
}): LlmModelPart | undefined {
  let { devModel, devProvider, openAiModel } = item;

  if (openAiModel === undefined) {
    return undefined;
  }

  let hasTextInput: boolean =
    devModel.modalities?.input.includes('text') ?? false;

  let hasTextOutput: boolean =
    devModel.modalities?.output.includes('text') ?? false;

  if (!hasTextInput || !hasTextOutput || !devModel.tool_call) {
    return undefined;
  }

  let isOpencodeSupported: boolean = isModelSupportedByOpencode({
    modelId: devModel.id
  });

  let variants: string[] = [];
  if (devModel.reasoning) {
    // Adapted from external/opencode/packages/opencode/src/provider/transform.ts
    // ProviderTransform.variants for the pinned OpenCode version.
    let widelySupportedEfforts: string[] = ['low', 'medium', 'high'];

    if (devModel.id !== 'gpt-5-pro') {
      variants = [...widelySupportedEfforts];

      let isGpt5: boolean =
        devModel.id.includes('gpt-5-') || devModel.id === 'gpt-5';

      if (isGpt5) {
        variants.unshift('minimal');
      }

      let isCodex: boolean = devModel.id.includes('codex');

      if (isCodex) {
        let isCodexXhigh: boolean =
          devModel.id.includes('5.2') || devModel.id.includes('5.3');

        variants = isCodexXhigh
          ? [...widelySupportedEfforts, 'xhigh']
          : widelySupportedEfforts;
      } else {
        if (devModel.release_date >= '2025-11-13') {
          variants.unshift('none');
        }
        if (devModel.release_date >= '2025-12-04') {
          variants.push('xhigh');
        }
      }
    }
  }

  let providerModelInfo: Record<string, unknown> = {
    modelsDev: devModel,
    modelsDevProvider: {
      api: devProvider.api,
      name: devProvider.name,
      env: devProvider.env,
      id: devProvider.id,
      npm: devProvider.npm
    },
    openAi: openAiModel
  };

  return {
    modelId: devModel.id,
    catalogName: devModel.name,
    providerModelInfo: providerModelInfo,
    modelsDevStatus: devModel.status,
    contextLimit: devModel.limit.context,
    inputLimit: devModel.limit.input,
    outputLimit: devModel.limit.output,
    variants: variants.length > 0 ? variants : undefined,
    isOpencodeSupported: isOpencodeSupported
  };
}

function isCodexModelSupportedByOpencode(item: { modelId: string }): boolean {
  let { modelId } = item;

  let isCodexModel: boolean = modelId.includes('codex');

  let isAllowedModel: boolean = CODEX_ALLOWED_MODELS_EDITOR.includes(modelId);

  let isModelSupported: boolean = isModelSupportedByOpencode({
    modelId: modelId
  });

  let isSupported: boolean =
    isModelSupported && (isCodexModel || isAllowedModel);

  return isSupported;
}

function isModelSupportedByOpencode(item: { modelId: string }): boolean {
  let { modelId } = item;

  let isSupported: boolean = modelId !== 'gpt-5-chat-latest';

  return isSupported;
}
