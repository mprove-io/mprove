import { Result } from '@praha/byethrow';
import { validateMcpEnvAccess } from '#backend/functions/mcp/validate-mcp-env-access/validate-mcp-env-access';
import type { ValidateMcpRepoBranchEnvAccessError } from '#common/types/backend/function-errors/validate-mcp-repo-branch-env-access-error';
import type { McpApiKeyParsed } from '#common/types/backend/parts/api-key/mcp-api-key-parsed';
import { validateMcpSessionBranchId } from './validate-mcp-session-branch-id/validate-mcp-session-branch-id';
import { validateMcpSessionRepoId } from './validate-mcp-session-repo-id/validate-mcp-session-repo-id';
import { validateMcpUserRepoId } from './validate-mcp-user-repo-id/validate-mcp-user-repo-id';

export function validateMcpRepoBranchEnvAccess(item: {
  repoId: string;
  branchId: string;
  envId: string;
  apiKeyParsed?: McpApiKeyParsed;
}): Result.Result<void, ValidateMcpRepoBranchEnvAccessError> {
  return Result.pipe(
    Result.succeed(item),
    Result.andThrough(v =>
      v.apiKeyParsed?.apiKeyType === 'PK'
        ? validateMcpUserRepoId({
            repoId: v.repoId,
            userId: v.apiKeyParsed.userId
          })
        : Result.succeed()
    ),
    Result.andThrough(v =>
      v.apiKeyParsed?.apiKeyType === 'SK'
        ? validateMcpSessionRepoId({
            repoId: v.repoId,
            sessionRepoId: v.apiKeyParsed.repoId
          })
        : Result.succeed()
    ),
    Result.andThrough(v =>
      v.apiKeyParsed?.apiKeyType === 'SK'
        ? validateMcpSessionBranchId({
            branchId: v.branchId,
            sessionBranchId: v.apiKeyParsed.branchId
          })
        : Result.succeed()
    ),
    Result.andThen(v =>
      validateMcpEnvAccess({
        envId: v.envId,
        apiKeyParsed: v.apiKeyParsed
      })
    )
  );
}
