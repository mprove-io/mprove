import { Result } from '@praha/byethrow';
import type { ParseApiKeyError } from '#common/types/backend/function-errors/parse-api-key-error';
import type { ApiKeyType } from '#common/types/backend/parts/api-key/api-key-type';

export type ParseApiKeyOutput = {
  type: ApiKeyType;
  prefix: string;
  entityId: string;
  secret: string;
};

export function parseApiKeyResult(item: {
  fullKey: string;
}): Result.Result<ParseApiKeyOutput, ParseApiKeyError> {
  let { fullKey } = item;

  let parts: string[] = fullKey.split('-');

  if (parts.length !== 4) {
    return Result.fail({ code: 'BACKEND_WRONG_API_KEY_FORMAT' });
  }

  let type: ApiKeyType = parts[0] as ApiKeyType;

  let prefix: string = parts[1];

  let entityId: string = type === 'SK' ? parts[2].toLowerCase() : parts[2];

  let secret: string = parts[3];

  return Result.succeed({
    type: type,
    prefix: prefix,
    entityId: entityId,
    secret: secret
  });
}
