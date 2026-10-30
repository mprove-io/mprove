import { Result } from '@praha/byethrow';
import type { ProviderTab } from '#backend/drizzle/postgres/tables/providers';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { GetProviderModelCheckExistsError } from '#common/types/backend/function-errors/get-provider-model-check-exists-error';
import type { LlmModel } from '#common/types/backend/parts/llm-models/llm-model';

export function getProviderModelCheckExists(item: {
  provider: ProviderTab;
  modelId: string;
}): Result.Result<LlmModel, GetProviderModelCheckExistsError> {
  let { provider, modelId } = item;

  let model: LlmModel = provider.models.find(
    model => model.modelId === modelId
  );

  if (isUndefined(model)) {
    return Result.fail({ code: 'BACKEND_LLM_MODEL_DOES_NOT_EXIST' });
  }

  return Result.succeed(model);
}
