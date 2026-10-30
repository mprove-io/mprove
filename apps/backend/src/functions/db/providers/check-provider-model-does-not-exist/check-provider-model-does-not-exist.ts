import { Result } from '@praha/byethrow';
import type { ProviderTab } from '#backend/drizzle/postgres/tables/providers';
import type { CheckProviderModelDoesNotExistError } from '#common/types/backend/function-errors/check-provider-model-does-not-exist-error';

export function checkProviderModelDoesNotExist(item: {
  provider: ProviderTab;
  modelId: string;
}): Result.Result<void, CheckProviderModelDoesNotExistError> {
  let { provider, modelId } = item;

  if (provider.models.some(model => model.modelId === modelId)) {
    return Result.fail({ code: 'BACKEND_LLM_MODEL_ALREADY_EXISTS' });
  }

  return Result.succeed();
}
