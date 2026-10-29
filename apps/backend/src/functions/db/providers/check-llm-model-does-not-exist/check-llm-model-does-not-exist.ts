import { Result } from '@praha/byethrow';
import type { ProviderTab } from '#backend/drizzle/postgres/tables/providers';
import type { CheckLlmModelDoesNotExistError } from '#common/types/backend/function-errors/check-llm-model-does-not-exist-error';

export function checkLlmModelDoesNotExist(item: {
  provider: ProviderTab;
  modelId: string;
}): Result.Result<void, CheckLlmModelDoesNotExistError> {
  let { provider, modelId } = item;

  if (provider.models.some(model => model.modelId === modelId)) {
    return Result.fail({ code: 'BACKEND_LLM_MODEL_ALREADY_EXISTS' });
  }

  return Result.succeed();
}
