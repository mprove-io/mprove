import { Result } from '@praha/byethrow';
import { PROD_REPO_ID } from '#common/constants/top';
import type { ValidateMcpSessionRepoIdError } from '#common/types/backend/function-errors/validate-mcp-session-repo-id-error';

export function validateMcpSessionRepoId(item: {
  repoId: string;
  sessionRepoId: string;
}): Result.Result<void, ValidateMcpSessionRepoIdError> {
  let { repoId, sessionRepoId } = item;

  if (repoId !== sessionRepoId && repoId !== PROD_REPO_ID) {
    return Result.fail({ code: 'BACKEND_REPO_ID_DOES_NOT_MATCH_SESSION' });
  }

  return Result.succeed();
}
