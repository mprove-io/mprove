import { Inject, Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { BranchTab } from '#backend/drizzle/postgres/schema/_tabs';
import {
  type BranchEnt,
  branchesTable
} from '#backend/drizzle/postgres/schema/branches';
import { HashService } from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { CheckBranchDoesNotExistResultError } from '#common/types/backend/function-errors/check-branch-does-not-exist-result-error';
import type { GetBranchCheckExistsResultError } from '#common/types/backend/function-errors/get-branch-check-exists-result-error';

@Injectable()
export class BranchesService {
  constructor(
    private tabService: TabService,
    private hashService: HashService,
    @Inject(DRIZZLE) private db: Db
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

  async getBranchCheckExists(item: {
    projectId: string;
    repoId: string;
    branchId: string;
  }): Promise<BranchTab> {
    let result: Result.Result<BranchTab, GetBranchCheckExistsResultError> =
      await this.getBranchCheckExistsResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let branch: BranchTab = result.value;

    return branch;
  }

  async getBranchCheckExistsResult(item: {
    projectId: string;
    repoId: string;
    branchId: string;
  }): Result.ResultAsync<BranchTab, GetBranchCheckExistsResultError> {
    let { projectId, repoId, branchId } = item;

    return this.db.drizzle.query.branchesTable
      .findFirst({
        where: and(
          eq(branchesTable.projectId, projectId),
          eq(branchesTable.repoId, repoId),
          eq(branchesTable.branchId, branchId)
        )
      })
      .then((branchEnt: BranchEnt) =>
        isUndefined(branchEnt)
          ? Result.fail({ code: 'BACKEND_BRANCH_DOES_NOT_EXIST' })
          : this.tabService.branchEntToTabResult({ branchEnt: branchEnt })
      );
  }

  async checkBranchDoesNotExistResult(item: {
    projectId: string;
    repoId: string;
    branchId: string;
  }): Result.ResultAsync<void, CheckBranchDoesNotExistResultError> {
    let { projectId, repoId, branchId } = item;

    let branchEnt: BranchEnt =
      await this.db.drizzle.query.branchesTable.findFirst({
        where: and(
          eq(branchesTable.projectId, projectId),
          eq(branchesTable.repoId, repoId),
          eq(branchesTable.branchId, branchId)
        )
      });

    if (isDefined(branchEnt)) {
      return Result.fail({
        code: 'BACKEND_BRANCH_ALREADY_EXISTS'
      });
    }

    return Result.succeed();
  }
}
