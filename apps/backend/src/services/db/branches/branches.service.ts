import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BranchTab } from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { DbService } from '#backend/services/db/db.service';
import { HashService } from '#backend/services/hash/hash.service';
import type { CheckBranchDoesNotExistError } from '#common/types/backend/function-errors/check-branch-does-not-exist-error';

@Injectable()
export class BranchesService {
  constructor(
    private hashService: HashService,
    private db: DbService
  ) {}

  makeBranch(item: {
    projectId: string;
    repoId: string;
    branchId: string;
  }): BranchTab {
    let { projectId, repoId, branchId } = item;

    let branch: BranchTab = {
      branchFullId: this.hashService.makeBranchFullId({
        projectId: projectId,
        repoId: repoId,
        branchId: branchId
      }),
      projectId: projectId,
      repoId: repoId,
      branchId: branchId,
      keyTag: undefined,
      serverTs: undefined
    };

    return branch;
  }

  async checkBranchDoesNotExist(item: {
    projectId: string;
    repoId: string;
    branchId: string;
  }): Result.ResultAsync<void, CheckBranchDoesNotExistError> {
    let { projectId, repoId, branchId } = item;

    let isBranchExist: boolean = await this.db.branches.isExistUnwrap({
      where: and(
        eq(branchesTable.projectId, projectId),
        eq(branchesTable.repoId, repoId),
        eq(branchesTable.branchId, branchId)
      )
    });

    if (isBranchExist) {
      return Result.fail({
        code: 'BACKEND_BRANCH_ALREADY_EXISTS'
      });
    }

    return Result.succeed();
  }
}
