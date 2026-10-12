import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import type { Request } from 'express';
import { PROD_REPO_ID } from '#common/constants/top';
import type { ValidateSessionBranchIdError } from '#common/types/backend/function-errors/validate-session-branch-id-error';
import type { ValidateSessionEnvIdError } from '#common/types/backend/function-errors/validate-session-env-id-error';
import type { ValidateSessionProjectIdError } from '#common/types/backend/function-errors/validate-session-project-id-error';
import type { ValidateSessionRepoIdError } from '#common/types/backend/function-errors/validate-session-repo-id-error';
import type { ValidateUserRepoIdError } from '#common/types/backend/function-errors/validate-user-repo-id-error';

@Injectable()
export class ToolService {
  validateUserRepoIdResult(item: {
    repoId: string;
    userId: string;
  }): Result.Result<void, ValidateUserRepoIdError> {
    let { repoId, userId } = item;

    if (repoId !== userId && repoId !== PROD_REPO_ID) {
      return Result.fail({
        code: 'BACKEND_REPO_ID_DOES_NOT_MATCH_USER'
      });
    }

    return Result.succeed();
  }

  validateSessionProjectIdResult(item: {
    projectId: string;
    request: Request;
  }): Result.Result<void, ValidateSessionProjectIdError> {
    let { projectId, request } = item;

    let apiKeyToValidateProjectId = (request as any)
      .apiKeyToValidateProjectId as string;

    if (projectId !== apiKeyToValidateProjectId) {
      return Result.fail({
        code: 'BACKEND_PROJECT_ID_DOES_NOT_MATCH_SESSION'
      });
    }

    return Result.succeed();
  }

  validateSessionRepoIdResult(item: {
    repoId: string;
    request: Request;
  }): Result.Result<void, ValidateSessionRepoIdError> {
    let { repoId, request } = item;

    let apiKeyToValidateSessionId = (request as any)
      .apiKeyToValidateSessionId as string;

    if (repoId !== apiKeyToValidateSessionId && repoId !== PROD_REPO_ID) {
      return Result.fail({
        code: 'BACKEND_REPO_ID_DOES_NOT_MATCH_SESSION'
      });
    }

    return Result.succeed();
  }

  validateSessionEnvIdResult(item: {
    envId: string;
    request: Request;
  }): Result.Result<void, ValidateSessionEnvIdError> {
    let { envId, request } = item;

    let apiKeyToValidateEnvId = (request as any)
      .apiKeyToValidateEnvId as string;

    if (envId !== apiKeyToValidateEnvId) {
      return Result.fail({
        code: 'BACKEND_ENV_ID_DOES_NOT_MATCH_SESSION'
      });
    }

    return Result.succeed();
  }

  validateSessionBranchIdResult(item: {
    branchId: string;
    request: Request;
  }): Result.Result<void, ValidateSessionBranchIdError> {
    let { branchId, request } = item;

    let apiKeyToValidateBranchId = (request as any)
      .apiKeyToValidateBranchId as string;

    if (branchId !== apiKeyToValidateBranchId) {
      return Result.fail({
        code: 'BACKEND_BRANCH_ID_DOES_NOT_MATCH_SESSION'
      });
    }

    return Result.succeed();
  }
}
