import { Result } from '@praha/byethrow';
import { validateMcpRepoBranchEnvAccess } from '#backend/functions/mcp/validate-mcp-repo-branch-env-access/validate-mcp-repo-branch-env-access';
import type { ValidateMcpProjectRepoBranchEnvAccessError } from '#common/types/backend/function-errors/validate-mcp-project-repo-branch-env-access-error';
import type { McpApiKeyParsed } from '#common/types/backend/parts/api-key/mcp-api-key-parsed';
import { validateMcpSessionProjectId } from './validate-mcp-session-project-id/validate-mcp-session-project-id';

export function validateMcpProjectRepoBranchEnvAccess(item: {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  apiKeyParsed?: McpApiKeyParsed;
}): Result.Result<void, ValidateMcpProjectRepoBranchEnvAccessError> {
  return Result.pipe(
    Result.succeed(item),
    Result.andThrough(v =>
      v.apiKeyParsed?.apiKeyType === 'SK'
        ? validateMcpSessionProjectId({
            projectId: v.projectId,
            sessionProjectId: v.apiKeyParsed.projectId
          })
        : Result.succeed()
    ),
    Result.andThen(v =>
      validateMcpRepoBranchEnvAccess({
        repoId: v.repoId,
        branchId: v.branchId,
        envId: v.envId,
        apiKeyParsed: v.apiKeyParsed
      })
    )
  );
}
