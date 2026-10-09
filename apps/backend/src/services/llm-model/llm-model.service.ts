import Anthropic from '@anthropic-ai/sdk';
import { Injectable } from '@nestjs/common';
import {
  type Model,
  Models,
  type Provider,
  type ProviderMap
} from '@opencode-ai/models';
import { Result } from '@praha/byethrow';
import OpenAI from 'openai';
import { isCodexModelSupportedByOpencode } from '#backend/functions/llm-providers/codex/is-codex-model-supported-by-opencode/is-codex-model-supported-by-opencode';
import {
  type CodexModelsResult,
  CodexService
} from '#backend/services/codex/codex.service';
import { anthropicModelToLlmModelPart } from '#backend/services/llm-model/anthropic-model-to-llm-model-part/anthropic-model-to-llm-model-part';
import { codexModelToLlmModelPart } from '#backend/services/llm-model/codex-model-to-llm-model-part/codex-model-to-llm-model-part';
import { openAiModelToLlmModelPart } from '#backend/services/llm-model/open-ai-model-to-llm-model-part/open-ai-model-to-llm-model-part';
import type { ModelCatalogProviderType } from '#backend/types/model-catalog-provider-type';
import { LLM_MODEL_DEFAULT_VARIANT } from '#common/constants/llm-models';
import { OPENAI_PROVIDER_ID } from '#common/constants/providers';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { BackendLlmModelNotDiscoveredError } from '#common/types/backend/errors/backend-llm-model-not-discovered-error';
import type { GetAnthropicModelPartsResultError } from '#common/types/backend/function-errors/get-anthropic-model-parts-result-error';
import type { GetDiscoveredLlmModelPartResultError } from '#common/types/backend/function-errors/get-discovered-llm-model-part-result-error';
import type { GetModelPartsResultError } from '#common/types/backend/function-errors/get-model-parts-result-error';
import type { ReconcileDiscoveredModelVariantsResultError } from '#common/types/backend/function-errors/reconcile-discovered-model-variants-result-error';
import type { RefreshModelResultError } from '#common/types/backend/function-errors/refresh-model-result-error';
import type { ValidateManualModelLimitsResultError } from '#common/types/backend/function-errors/validate-manual-model-limits-result-error';
import type { ValidateModelVariantsResultError } from '#common/types/backend/function-errors/validate-model-variants-result-error';
import type { LlmModel } from '#common/types/backend/parts/llm-models/llm-model';
import type { LlmModelInput } from '#common/types/backend/parts/llm-models/llm-model-input';
import type { LlmModelPart } from '#common/types/backend/parts/llm-models/llm-model-part';
import type { LlmModelVariant } from '#common/types/backend/parts/llm-models/llm-model-variant';
import type { ProviderType } from '#common/types/backend/parts/provider/provider-type';
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
  async refreshModelResult(item: {
    providerType: ProviderType;
    apiKey?: string;
    userId?: string;
    isCodexAuthSet?: boolean;
    modelInput: LlmModelInput;
    variants: LlmModelVariant[];
    isForceRefresh?: boolean;
  }): Result.ResultAsync<LlmModel, RefreshModelResultError> {
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
      providerType === 'OpenAICodex' && modelInput.isManual === true;

    let isManualModel: boolean =
      providerType === 'OpenAICompatible' || isManualCodexModel;

    if (isManualModel) {
      let limitsResult: Result.Result<
        void,
        ValidateManualModelLimitsResultError
      > = this.validateManualModelLimitsResult({ modelInput: modelInput });

      if (Result.isFailure(limitsResult)) {
        return limitsResult;
      }
    }

    if (providerType === 'OpenAICompatible' || isManualCodexModel) {
      let isOpencodeSupported: boolean =
        providerType === 'OpenAICompatible'
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

      let variantsResult: Result.Result<
        void,
        ValidateModelVariantsResultError
      > = this.validateModelVariantsResult({
        variants: model.variants,
        isExplorer: model.isExplorer,
        isBuilder: model.isBuilder
      });

      if (Result.isFailure(variantsResult)) {
        return variantsResult;
      }

      return Result.succeed(model);
    }

    let discoveryResult: Result.Result<
      LlmModelPart,
      GetDiscoveredLlmModelPartResultError
    > = await this.getDiscoveredLlmModelPartResult({
      providerType: providerType,
      modelId: modelInput.modelId,
      apiKey: apiKey,
      userId: userId,
      isCodexAuthSet: isCodexAuthSet,
      isForceRefresh: isForceRefresh
    });

    if (Result.isFailure(discoveryResult)) {
      return discoveryResult;
    }

    let modelPart: LlmModelPart = discoveryResult.value;

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

    let reconciledResult: Result.Result<
      LlmModelVariant[],
      ReconcileDiscoveredModelVariantsResultError
    > = this.reconcileDiscoveredModelVariantsResult({
      variants: model.variants,
      storedVariants: [],
      currentVariantNames: currentVariantNames,
      isExplorer: model.isExplorer,
      isBuilder: model.isBuilder
    });

    if (Result.isFailure(reconciledResult)) {
      return reconciledResult;
    }

    model.variants = reconciledResult.value;

    let variantsResult: Result.Result<void, ValidateModelVariantsResultError> =
      this.validateModelVariantsResult({
        variants: model.variants,
        isExplorer: model.isExplorer,
        isBuilder: model.isBuilder
      });

    if (Result.isFailure(variantsResult)) {
      return variantsResult;
    }

    return Result.succeed(model);
  }

  async getDiscoveredLlmModelPartResult(item: {
    providerType: ModelCatalogProviderType;
    modelId: string;
    apiKey?: string;
    userId?: string;
    isCodexAuthSet?: boolean;
    isForceRefresh?: boolean;
  }): Result.ResultAsync<LlmModelPart, GetDiscoveredLlmModelPartResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'discovery',
        (
          v
        ): Result.ResultAsync<LlmModelPartsResult, GetModelPartsResultError> =>
          this.getModelPartsResult({
            providerType: v.providerType,
            apiKey: v.apiKey,
            userId: v.userId,
            isCodexAuthSet: v.isCodexAuthSet,
            isForceRefresh: v.isForceRefresh
          })
      ),
      Result.andThen(
        (v): Result.Result<LlmModelPart, BackendLlmModelNotDiscoveredError> => {
          let modelPart: LlmModelPart = v.discovery.modelParts.find(
            modelPart => modelPart.modelId === v.modelId
          );

          return isUndefined(modelPart)
            ? Result.fail({ code: 'BACKEND_LLM_MODEL_NOT_DISCOVERED' })
            : Result.succeed(modelPart);
        }
      )
    );
  }

  validateModelVariantsResult(item: {
    variants: LlmModelVariant[];
    isExplorer: boolean;
    isBuilder: boolean;
  }): Result.Result<void, ValidateModelVariantsResultError> {
    let { variants, isExplorer, isBuilder } = item;

    let variantNames: string[] = variants.map(variant => variant.variant);

    let normalizedVariantNames: string[] = variantNames.map(variantName =>
      variantName.toLocaleLowerCase()
    );

    let uniqueVariantNames: Set<string> = new Set(normalizedVariantNames);

    let isUniqueVariantNames: boolean =
      uniqueVariantNames.size === normalizedVariantNames.length;

    let isDefaultVariantPresent: boolean = variantNames.includes(
      LLM_MODEL_DEFAULT_VARIANT
    );

    let explorerEnabledCount: number = variants.filter(
      variant => variant.isExplorer
    ).length;

    let builderEnabledCount: number = variants.filter(
      variant => variant.isBuilder
    ).length;

    let isExplorerVariantEnabled: boolean =
      isExplorer === false || explorerEnabledCount > 0;

    let isBuilderVariantEnabled: boolean =
      isBuilder === false || builderEnabledCount > 0;

    let isInvalid: boolean =
      isUniqueVariantNames === false ||
      isDefaultVariantPresent === false ||
      isExplorerVariantEnabled === false ||
      isBuilderVariantEnabled === false;

    if (isInvalid) {
      return Result.fail({ code: 'BACKEND_LLM_MODEL_VARIANTS_INVALID' });
    }

    return Result.succeed();
  }

  reconcileDiscoveredModelVariantsResult(item: {
    variants: LlmModelVariant[];
    storedVariants: LlmModelVariant[];
    currentVariantNames: string[];
    isExplorer: boolean;
    isBuilder: boolean;
  }): Result.Result<
    LlmModelVariant[],
    ReconcileDiscoveredModelVariantsResultError
  > {
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

    let isUniqueVariantNames: boolean =
      uniqueVariantNames.size === normalizedVariantNames.length;

    if (isUniqueVariantNames === false) {
      return Result.fail({ code: 'BACKEND_LLM_MODEL_VARIANTS_INVALID' });
    }

    let isUnknownVariantPresent: boolean = variants.some(
      variant =>
        currentNames.has(variant.variant) === false &&
        storedNames.has(variant.variant) === false
    );

    if (isUnknownVariantPresent) {
      return Result.fail({ code: 'BACKEND_LLM_MODEL_VARIANTS_INVALID' });
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

    return Result.succeed(adjustedVariants);
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

  validateManualModelLimitsResult(item: {
    modelInput: LlmModelInput;
  }): Result.Result<void, ValidateManualModelLimitsResultError> {
    let { modelInput } = item;

    if (isUndefined(modelInput.contextLimit)) {
      return Result.fail({
        code: 'BACKEND_LLM_MODEL_CONTEXT_LIMIT_REQUIRED'
      });
    }

    let isInputLimitInvalid: boolean =
      isDefined(modelInput.inputLimit) &&
      modelInput.inputLimit > modelInput.contextLimit;

    let isOutputLimitInvalid: boolean =
      isDefined(modelInput.outputLimit) &&
      modelInput.outputLimit > modelInput.contextLimit;

    if (isInputLimitInvalid || isOutputLimitInvalid) {
      return Result.fail({ code: 'BACKEND_LLM_MODEL_LIMIT_INVALID' });
    }

    return Result.succeed();
  }

  async getModelPartsResult(item: {
    providerType: ModelCatalogProviderType;
    apiKey?: string;
    userId?: string;
    isCodexAuthSet?: boolean;
    isForceRefresh?: boolean;
  }): Result.ResultAsync<LlmModelPartsResult, GetModelPartsResultError> {
    let { providerType, apiKey, userId, isCodexAuthSet, isForceRefresh } = item;

    if (providerType !== 'OpenAICodex' && !isDefinedAndNotEmpty(apiKey)) {
      return Result.fail({ code: 'BACKEND_PROVIDER_API_KEY_REQUIRED' });
    }

    if (providerType === 'OpenAICodex') {
      let isCodexModelsAvailable: boolean =
        isCodexAuthSet === true && isDefinedAndNotEmpty(userId);

      if (isCodexModelsAvailable === false) {
        let result: LlmModelPartsResult = { modelParts: [] };

        return Result.succeed(result);
      }

      let codexModelsResult: CodexModelsResult =
        await this.codexService.getModels({ userId: userId });

      if (isDefinedAndNotEmpty(codexModelsResult.errorMessage)) {
        let result: LlmModelPartsResult = {
          modelParts: [],
          errorMessage: codexModelsResult.errorMessage
        };

        return Result.succeed(result);
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

      return Result.succeed(result);
    }

    if (providerType === 'Anthropic') {
      return this.getAnthropicModelPartsResult({
        apiKey: apiKey as string
      }).then(result =>
        Result.isFailure(result)
          ? result
          : Result.succeed({ modelParts: result.value })
      );
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
          signal: AbortSignal.timeout(10000)
        });

        this.modelsDev = modelsDev;

        this.modelsDevTs = Date.now();
      } catch (error) {
        return Result.fail({ code: 'BACKEND_LLM_MODEL_DISCOVERY_FAILED' });
      }
    }

    let devProvider: Provider = modelsDev[OPENAI_PROVIDER_ID];

    if (!devProvider) {
      return Result.fail({ code: 'BACKEND_LLM_MODEL_DISCOVERY_FAILED' });
    }

    let devModels: Model[] = Object.values(devProvider.models);

    let openAiModelsById: Map<string, OpenAI.Models.Model> = new Map();

    try {
      let openAiClient: OpenAI = new OpenAI({
        apiKey: apiKey,
        timeout: 10000,
        maxRetries: 0
      });

      let openAiResponse: OpenAI.Models.ModelsPage =
        await openAiClient.models.list();

      openAiModelsById = new Map(
        openAiResponse.data.map(model => [model.id, model])
      );
    } catch (error) {
      if (error instanceof OpenAI.AuthenticationError) {
        return Result.fail({ code: 'BACKEND_PROVIDER_NOT_VALID_API_KEY' });
      }

      return Result.fail({ code: 'BACKEND_LLM_MODEL_DISCOVERY_FAILED' });
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

    return Result.succeed(result);
  }

  private async getAnthropicModelPartsResult(item: {
    apiKey: string;
  }): Result.ResultAsync<LlmModelPart[], GetAnthropicModelPartsResultError> {
    let { apiKey } = item;

    let anthropicModels: Anthropic.Models.ModelInfo[] = [];

    try {
      let anthropicClient: Anthropic = new Anthropic({
        apiKey: apiKey,
        timeout: 10000,
        maxRetries: 0
      });

      let page: Anthropic.Models.ModelInfosPage =
        await anthropicClient.models.list({ limit: 1000 });

      anthropicModels.push(...page.data);

      let isNextPageAvailable: boolean = page.hasNextPage();

      while (isNextPageAvailable) {
        page = await page.getNextPage();

        anthropicModels.push(...page.data);

        isNextPageAvailable = page.hasNextPage();
      }
    } catch (error) {
      if (error instanceof Anthropic.AuthenticationError) {
        return Result.fail({ code: 'BACKEND_PROVIDER_NOT_VALID_API_KEY' });
      }

      return Result.fail({ code: 'BACKEND_LLM_MODEL_DISCOVERY_FAILED' });
    }

    let modelParts: LlmModelPart[] = anthropicModels.map(anthropicModel =>
      anthropicModelToLlmModelPart({ anthropicModel: anthropicModel })
    );

    return Result.succeed(modelParts);
  }
}
