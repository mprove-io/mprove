import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { PROD_REPO_ID } from '#common/constants/top';
import { ErEnum } from '#common/enums/er.enum';
import { ServerError } from '#common/models/server-error';

@Injectable()
export class ToolService {
  validateUserRepoId(item: { repoId: string; userId: string }) {
    let { repoId, userId } = item;

    if (repoId !== userId && repoId !== PROD_REPO_ID) {
      throw new ServerError({
        message: ErEnum.BACKEND_REPO_ID_DOES_NOT_MATCH_USER
      });
    }
  }

  validateSessionRepoId(item: { repoId: string; request: Request }) {
    let { repoId, request } = item;

    let apiKeyToValidateSessionId = (request as any)
      .apiKeyToValidateSessionId as string;

    if (repoId !== apiKeyToValidateSessionId && repoId !== PROD_REPO_ID) {
      throw new ServerError({
        message: ErEnum.BACKEND_REPO_ID_DOES_NOT_MATCH_SESSION
      });
    }
  }

  validateSessionEnvId(item: { envId: string; request: Request }) {
    let { envId, request } = item;

    let apiKeyToValidateEnvId = (request as any)
      .apiKeyToValidateEnvId as string;

    if (envId !== apiKeyToValidateEnvId) {
      throw new ServerError({
        message: ErEnum.BACKEND_ENV_ID_DOES_NOT_MATCH_SESSION
      });
    }
  }

  validateSessionBranchId(item: { branchId: string; request: Request }) {
    let { branchId, request } = item;

    let apiKeyToValidateBranchId = (request as any)
      .apiKeyToValidateBranchId as string;

    if (branchId !== apiKeyToValidateBranchId) {
      throw new ServerError({
        message: ErEnum.BACKEND_BRANCH_ID_DOES_NOT_MATCH_SESSION
      });
    }
  }
}
