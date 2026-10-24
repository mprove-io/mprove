import { Result } from '@praha/byethrow';
import type { ValidateMcpSessionProjectIdError } from '#common/types/backend/function-errors/validate-mcp-session-project-id-error';

export function validateMcpSessionProjectId(item: {
  projectId: string;
  sessionProjectId: string;
}): Result.Result<void, ValidateMcpSessionProjectIdError> {
  let { projectId, sessionProjectId } = item;

  if (projectId !== sessionProjectId) {
    return Result.fail({ code: 'BACKEND_PROJECT_ID_DOES_NOT_MATCH_SESSION' });
  }

  return Result.succeed();
}
