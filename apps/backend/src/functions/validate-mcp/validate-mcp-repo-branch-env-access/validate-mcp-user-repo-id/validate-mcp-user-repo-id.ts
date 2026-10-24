import { Result } from '@praha/byethrow';
import { PROD_REPO_ID } from '#common/constants/top';
import type { ValidateMcpUserRepoIdError } from '#common/types/backend/function-errors/validate-mcp-user-repo-id-error';

export function validateMcpUserRepoId(item: {
  repoId: string;
  userId: string;
}): Result.Result<void, ValidateMcpUserRepoIdError> {
  let { repoId, userId } = item;

  if (repoId !== userId && repoId !== PROD_REPO_ID) {
    return Result.fail({ code: 'BACKEND_REPO_ID_DOES_NOT_MATCH_USER' });
  }

  return Result.succeed();
}
