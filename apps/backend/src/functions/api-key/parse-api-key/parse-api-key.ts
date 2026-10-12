import { Result } from '@praha/byethrow';
import {
  type ParseApiKeyOutput,
  parseApiKeyResult
} from '#backend/functions/api-key/parse-api-key-result/parse-api-key-result';
import { ServerError } from '#common/classes/server-error/server-error';
import type { ParseApiKeyError } from '#common/types/backend/function-errors/parse-api-key-error';

export function parseApiKey(item: { fullKey: string }): ParseApiKeyOutput {
  let { fullKey } = item;

  let result: Result.Result<ParseApiKeyOutput, ParseApiKeyError> =
    parseApiKeyResult({ fullKey: fullKey });

  if (Result.isFailure(result)) {
    throw new ServerError({
      message: result.error.code
    });
  }

  let output: ParseApiKeyOutput = result.value;

  return output;
}
