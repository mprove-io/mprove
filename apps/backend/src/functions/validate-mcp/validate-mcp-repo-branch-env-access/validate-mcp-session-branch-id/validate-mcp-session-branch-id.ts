import { Result } from '@praha/byethrow';
import type { ValidateMcpSessionBranchIdError } from '#common/types/backend/function-errors/validate-mcp-session-branch-id-error';

export function validateMcpSessionBranchId(item: {
  branchId: string;
  sessionBranchId: string;
}): Result.Result<void, ValidateMcpSessionBranchIdError> {
  let { branchId, sessionBranchId } = item;

  if (branchId !== sessionBranchId) {
    return Result.fail({ code: 'BACKEND_BRANCH_ID_DOES_NOT_MATCH_SESSION' });
  }

  return Result.succeed();
}
