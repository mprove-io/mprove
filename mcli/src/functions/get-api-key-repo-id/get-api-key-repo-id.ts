import { Result } from '@praha/byethrow';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ApiKeyType } from '#common/types/backend/parts/api-key/api-key-type';
import type { GetApiKeyRepoIdError } from '#mcli/types/function-errors/get-api-key-repo-id-error';

export function getApiKeyRepoId(item: {
  apiKey?: string;
}): Result.Result<string, GetApiKeyRepoIdError> {
  let { apiKey } = item;

  if (isUndefined(apiKey)) {
    return Result.fail({ code: 'MCLI_API_KEY_IS_NOT_DEFINED' });
  }

  let parts: string[] = apiKey.split('-');

  if (parts.length < 3 || parts[2].length === 0) {
    return Result.fail({ code: 'MCLI_API_KEY_INVALID_FORMAT' });
  }

  let repoId: string = apiKey.startsWith(`${'SK' satisfies ApiKeyType}-`)
    ? parts[2].toLowerCase()
    : parts[2];

  return Result.succeed(repoId);
}
