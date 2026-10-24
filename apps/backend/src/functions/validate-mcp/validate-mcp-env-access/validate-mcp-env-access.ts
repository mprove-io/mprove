import { Result } from '@praha/byethrow';
import type { ValidateMcpEnvAccessError } from '#common/types/backend/function-errors/validate-mcp-env-access-error';
import type { McpApiKeyParsed } from '#common/types/backend/parts/api-key/mcp-api-key-parsed';

export function validateMcpEnvAccess(item: {
  envId: string;
  apiKeyParsed?: McpApiKeyParsed;
}): Result.Result<void, ValidateMcpEnvAccessError> {
  let { envId, apiKeyParsed } = item;

  if (apiKeyParsed?.apiKeyType === 'SK' && envId !== apiKeyParsed.envId) {
    return Result.fail({ code: 'BACKEND_ENV_ID_DOES_NOT_MATCH_SESSION' });
  }

  return Result.succeed();
}
