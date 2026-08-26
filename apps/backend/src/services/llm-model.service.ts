import Anthropic from '@anthropic-ai/sdk';
import { Injectable } from '@nestjs/common';
import {
  type Model,
  Models,
  type Provider,
  type ProviderMap
} from '@opencode-ai/models';
import OpenAI from 'openai';
import { getAnthropicModelVariants } from '#backend/functions/anthropic-model-variants';
import { getOpenAiReasoningEfforts } from '#backend/functions/openai-model-variants';
import {
  type CodexModelsResult,
  CodexService
} from '#backend/services/codex.service';
import { LLM_MODEL_DEFAULT_VARIANT } from '#common/constants/llm-models';
import { OPENAI_PROVIDER_ID } from '#common/constants/providers';
import { ErEnum } from '#common/enums/er.enum';
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import { ServerError } from '#common/models/server-error';
import type { CodexModel } from '#common/zod/backend/codex-model';
import type { LlmModel } from '#common/zod/backend/llm-models/llm-model';
import type { LlmModelInput } from '#common/zod/backend/llm-models/llm-model-input';
import type { LlmModelPart } from '#common/zod/backend/llm-models/llm-model-part';
import type { LlmModelVariant } from '#common/zod/backend/llm-models/llm-model-variant';

export type LlmModelPartsResult = {
  modelParts: LlmModelPart[];
  errorMessage?: string;
};

@Injectable()
export class LlmModelService {
  private readonly modelsDevTtlMs = 60 * 60 * 1000;
  private modelsDev?: ProviderMap;
  private modelsDevTs?: number;

  constructor(private codexService: CodexService) {}

  async refreshModel(item: {
    providerType: ProviderTypeEnum;
    apiKey?: string;
    userId?: string;
    isCodexAuthSet?: boolean;
    modelInput: LlmModelInput;
    variants: LlmModelVariant[];
    isForceRefresh?: boolean;
  }): Promise<LlmModel> {
    let {
      providerType,
      apiKey,
      userId,
      isCodexAuthSet,
      modelInput,
      variants,
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
          ? true
          : isCodexModelSupportedByOpencode({ modelId: modelInput.modelId });

      let model: LlmModel = {
        modelId: modelInput.modelId,
        name: modelInput.name,
        isManual: isManualCodexModel,
        catalogName: undefined,
        contextLimit: modelInput.contextLimit,
        inputLimit: modelInput.inputLimit,
        outputLimit: modelInput.outputLimit,
        variants: variants,
        isOpencodeSupported: isOpencodeSupported,
        isExplorer: modelInput.isExplorer,
        isBuilder: modelInput.isBuilder,
        refreshedTs: refreshedTs
      };

      this.validateModelVariants({
        variants: model.variants,
        isExplorer: model.isExplorer,
        isBuilder: model.isBuilder
      });

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
      variants: variants,
      isExplorer: modelInput.isExplorer,
      isBuilder: modelInput.isBuilder,
      refreshedTs: refreshedTs
    };

    let currentVariantNames: string[] = [
      LLM_MODEL_DEFAULT_VARIANT,
      ...(modelPart.variants ?? [])
    ];

    model.variants = this.reconcileDiscoveredModelVariants({
      variants: model.variants,
      storedVariants: [],
      currentVariantNames: currentVariantNames,
      isExplorer: model.isExplorer,
      isBuilder: model.isBuilder
    });

    this.validateModelVariants({
      variants: model.variants,
      isExplorer: model.isExplorer,
      isBuilder: model.isBuilder
    });

    return model;
  }

  validateModelVariants(item: {
    variants: LlmModelVariant[];
    isExplorer: boolean;
    isBuilder: boolean;
  }): void {
    let { variants, isExplorer, isBuilder } = item;

    let variantNames: string[] = variants.map(variant => variant.variant);

    let normalizedVariantNames: string[] = variantNames.map(variantName =>
      variantName.toLocaleLowerCase()
    );

    let uniqueVariantNames: Set<string> = new Set(normalizedVariantNames);

    let hasUniqueVariantNames: boolean =
      uniqueVariantNames.size === normalizedVariantNames.length;

    let hasDefaultVariant: boolean = variantNames.includes(
      LLM_MODEL_DEFAULT_VARIANT
    );

    let explorerEnabledCount: number = variants.filter(
      variant => variant.isExplorer
    ).length;

    let builderEnabledCount: number = variants.filter(
      variant => variant.isBuilder
    ).length;

    let hasEnabledExplorerVariant: boolean =
      isExplorer === false || explorerEnabledCount > 0;

    let hasEnabledBuilderVariant: boolean =
      isBuilder === false || builderEnabledCount > 0;

    let isInvalid: boolean =
      hasUniqueVariantNames === false ||
      hasDefaultVariant === false ||
      hasEnabledExplorerVariant === false ||
      hasEnabledBuilderVariant === false;

    if (isInvalid) {
      throw new ServerError({
        message: ErEnum.BACKEND_PROVIDER_MODEL_VARIANTS_INVALID
      });
    }
  }

  reconcileDiscoveredModelVariants(item: {
    variants: LlmModelVariant[];
    storedVariants: LlmModelVariant[];
    currentVariantNames: string[];
    isExplorer: boolean;
    isBuilder: boolean;
  }): LlmModelVariant[] {
    let {
      variants,
      storedVariants,
      currentVariantNames,
      isExplorer,
      isBuilder
    } = item;

    let storedNames: Set<string> = new Set(
      storedVariants.map(variant => variant.variant)
    );

    let currentNames: Set<string> = new Set(currentVariantNames);

    let normalizedVariantNames: string[] = variants.map(variant =>
      variant.variant.toLocaleLowerCase()
    );

    let uniqueVariantNames: Set<string> = new Set(normalizedVariantNames);

    let hasUniqueVariantNames: boolean =
      uniqueVariantNames.size === normalizedVariantNames.length;

    if (hasUniqueVariantNames === false) {
      throw new ServerError({
        message: ErEnum.BACKEND_PROVIDER_MODEL_VARIANTS_INVALID
      });
    }

    let hasUnknownVariant: boolean = variants.some(
      variant =>
        currentNames.has(variant.variant) === false &&
        storedNames.has(variant.variant) === false
    );

    if (hasUnknownVariant) {
      throw new ServerError({
        message: ErEnum.BACKEND_PROVIDER_MODEL_VARIANTS_INVALID
      });
    }

    let submittedVariantsByName: Map<string, LlmModelVariant> = new Map(
      variants.map(variant => [variant.variant, variant])
    );

    let storedVariantsByName: Map<string, LlmModelVariant> = new Map(
      storedVariants.map(variant => [variant.variant, variant])
    );

    let reconciledVariants: LlmModelVariant[] = currentVariantNames.map(
      variantName =>
        submittedVariantsByName.get(variantName) ??
        storedVariantsByName.get(variantName) ?? {
          variant: variantName,
          isExplorer: false,
          isExplorerRecommended: false,
          isBuilder: false,
          isBuilderRecommended: false
        }
    );

    let adjustedVariants: LlmModelVariant[] = this.syncDiscoveredModelVariants({
      variants: reconciledVariants,
      currentVariantNames: currentVariantNames,
      isExplorer: isExplorer,
      isBuilder: isBuilder
    });

    return adjustedVariants;
  }

  syncDiscoveredModelVariants(item: {
    variants: LlmModelVariant[];
    currentVariantNames: string[];
    isExplorer: boolean;
    isBuilder: boolean;
  }): LlmModelVariant[] {
    let { variants, currentVariantNames, isExplorer, isBuilder } = item;

    let variantsByName: Map<string, LlmModelVariant> = new Map(
      variants.map(variant => [variant.variant, variant])
    );

    let syncedVariants: LlmModelVariant[] = currentVariantNames.map(
      variantName =>
        variantsByName.get(variantName) ?? {
          variant: variantName,
          isExplorer: false,
          isExplorerRecommended: false,
          isBuilder: false,
          isBuilderRecommended: false
        }
    );

    let hasEnabledExplorerVariant: boolean = syncedVariants.some(
      variant => variant.isExplorer
    );

    let hasEnabledBuilderVariant: boolean = syncedVariants.some(
      variant => variant.isBuilder
    );

    let adjustedVariants: LlmModelVariant[] = syncedVariants.map(variant => ({
      variant: variant.variant,
      isExplorer:
        variant.variant === LLM_MODEL_DEFAULT_VARIANT &&
        isExplorer &&
        hasEnabledExplorerVariant === false
          ? true
          : variant.isExplorer,
      isExplorerRecommended: variant.isExplorerRecommended,
      isBuilder:
        variant.variant === LLM_MODEL_DEFAULT_VARIANT &&
        isBuilder &&
        hasEnabledBuilderVariant === false
          ? true
          : variant.isBuilder,
      isBuilderRecommended: variant.isBuilderRecommended
    }));

    return adjustedVariants;
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

    let modelsDev: ProviderMap;

    if (isModelsDevFresh) {
      modelsDev = this.modelsDev as ProviderMap;
    } else {
      try {
        let modelsClient: ReturnType<typeof Models.make> = Models.make();

        modelsDev = await modelsClient.providers({
          signal: AbortSignal.timeout(10_000)
        });

        this.modelsDev = modelsDev;

        this.modelsDevTs = Date.now();
      } catch (error) {
        throw new ServerError({
          message: ErEnum.BACKEND_PROVIDER_MODEL_DISCOVERY_FAILED,
          originalError: error
        });
      }
    }

    let devProvider: Provider = modelsDev[OPENAI_PROVIDER_ID];

    if (!devProvider) {
      throw new ServerError({
        message: ErEnum.BACKEND_PROVIDER_MODEL_DISCOVERY_FAILED
      });
    }

    let devModels: Model[] = Object.values(devProvider.models);

    let openAiModelsById: Map<string, OpenAI.Models.Model> = new Map();

    try {
      let openAiClient: OpenAI = new OpenAI({
        apiKey: apiKey,
        timeout: 10_000,
        maxRetries: 0
      });

      let openAiResponse: OpenAI.Models.ModelsPage =
        await openAiClient.models.list();

      openAiModelsById = new Map(
        openAiResponse.data.map(model => [model.id, model])
      );
    } catch (error) {
      if (error instanceof OpenAI.AuthenticationError) {
        throw new ServerError({
          message: ErEnum.BACKEND_PROVIDER_NOT_VALID_API_KEY,
          originalError: error
        });
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

    let anthropicModels: Anthropic.Models.ModelInfo[] = [];

    try {
      let anthropicClient: Anthropic = new Anthropic({
        apiKey: apiKey,
        timeout: 10_000,
        maxRetries: 0
      });

      let page: Anthropic.Models.ModelInfosPage =
        await anthropicClient.models.list({ limit: 1000 });

      anthropicModels.push(...page.data);

      let hasNextPage: boolean = page.hasNextPage();

      while (hasNextPage) {
        page = await page.getNextPage();

        anthropicModels.push(...page.data);

        hasNextPage = page.hasNextPage();
      }
    } catch (error) {
      if (error instanceof Anthropic.AuthenticationError) {
        throw new ServerError({
          message: ErEnum.BACKEND_PROVIDER_NOT_VALID_API_KEY,
          originalError: error
        });
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
  anthropicModel: Anthropic.Models.ModelInfo;
}): LlmModelPart {
  let { anthropicModel } = item;

  let variants: string[] = getAnthropicModelVariants({
    anthropicModel: anthropicModel
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
    isOpencodeSupported: true
  };

  return modelPart;
}

function openAiModelToLlmModelPart(item: {
  devModel: Model;
  devProvider: Provider;
  openAiModel?: OpenAI.Models.Model;
}): LlmModelPart | undefined {
  let { devModel, devProvider, openAiModel } = item;

  if (openAiModel === undefined) {
    return undefined;
  }

  let hasTextInput: boolean =
    devModel.modalities?.input.includes('text') ?? false;

  let hasTextOutput: boolean =
    devModel.modalities?.output.includes('text') ?? false;

  let hasRequiredToolSupport: boolean =
    devModel.tool_call || devModel.id === 'gpt-5-chat-latest';

  if (!hasTextInput || !hasTextOutput || !hasRequiredToolSupport) {
    return undefined;
  }

  let variants: string[] = [];

  if (devModel.reasoning) {
    let effortOption = devModel.reasoning_options?.find(
      option => option.type === 'effort'
    );

    variants = effortOption
      ? effortOption.values.flatMap(value => {
          if (value === null) {
            return ['none'];
          }

          return typeof value === 'string' ? [value] : [];
        })
      : getOpenAiReasoningEfforts({
          modelId: devModel.id,
          releaseDate: devModel.release_date
        });
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

  let isOpencodeSupported: boolean =
    devModel.status !== 'alpha' && devModel.status !== 'deprecated';

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

  let allowedModels: Set<string> = new Set([
    'gpt-5.5',
    'gpt-5.3-codex-spark',
    'gpt-5.4',
    'gpt-5.4-mini'
  ]);

  let isExplicitlyAllowed: boolean = allowedModels.has(modelId);

  if (isExplicitlyAllowed) {
    return true;
  }

  let deniedModels: Set<string> = new Set(['gpt-5.5-pro', 'gpt-5.6']);

  let isExplicitlyDenied: boolean = deniedModels.has(modelId);

  if (isExplicitlyDenied) {
    return false;
  }

  let match: RegExpMatchArray | null = modelId.match(/^gpt-(\d+\.\d+)/);

  let version: number | undefined = match
    ? Number.parseFloat(match[1])
    : undefined;

  let isSupported: boolean = version !== undefined && version > 5.4;

  return isSupported;
}
