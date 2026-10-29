import { Result } from '@praha/byethrow';
import type { ProviderTab } from '#backend/drizzle/postgres/tables/providers';
import { getLlmModelCheckExists } from '#backend/functions/db/providers/get-llm-model-check-exists/get-llm-model-check-exists';
import { getEnabledProviderCheckExists } from '#backend/functions/db/providers/get-model-selection/get-enabled-provider-check-exists/get-enabled-provider-check-exists';
import type { DbService } from '#backend/services/db/db.service';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { GetModelSelectionError } from '#common/types/backend/function-errors/get-model-selection-error';
import type { LlmModel } from '#common/types/backend/parts/llm-models/llm-model';

export type GetModelSelectionOutput = {
  provider: ProviderTab;
  model: LlmModel;
};

export async function getModelSelection(item: {
  projectId: string;
  providerId: string;
  modelId: string;
  variant?: string;
  isUserCodexAuthSet: boolean;
  isBuilder: boolean;
  db: DbService;
}): Result.ResultAsync<GetModelSelectionOutput, GetModelSelectionError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('provider', v =>
      getEnabledProviderCheckExists({
        projectId: v.projectId,
        providerId: v.providerId,
        db: v.db
      })
    ),
    Result.bind('model', v =>
      getLlmModelCheckExists({
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
