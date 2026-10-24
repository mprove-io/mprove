import { Result } from '@praha/byethrow';
import type { ProviderTab } from '#backend/drizzle/postgres/schema/_tabs';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { GetLlmModelCheckExistsError } from '#common/types/backend/function-errors/get-llm-model-check-exists-error';
import type { LlmModel } from '#common/types/backend/parts/llm-models/llm-model';

export function getLlmModelCheckExists(item: {
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
