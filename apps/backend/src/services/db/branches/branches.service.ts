import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { BranchTab } from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { HashService } from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';

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
    let { projectId, repoId, branchId } = item;

    let branch = await this.db.drizzle.query.branchesTable
      .findFirst({
        where: and(
          eq(branchesTable.projectId, projectId),
          eq(branchesTable.repoId, repoId),
          eq(branchesTable.branchId, branchId)
        )
      })
      .then(x => this.tabService.branchEntToTab(x));

    if (isUndefined(branch)) {
      throw new ServerError({
        message: 'BACKEND_BRANCH_DOES_NOT_EXIST'
      });
    }

    return branch;
  }

  async checkBranchDoesNotExist(item: {
    projectId: string;
    repoId: string;
    branchId: string;
  }) {
    let { projectId, repoId, branchId } = item;

    let branch = await this.db.drizzle.query.branchesTable.findFirst({
      where: and(
        eq(branchesTable.projectId, projectId),
        eq(branchesTable.repoId, repoId),
        eq(branchesTable.branchId, branchId)
      )
    });

    if (isDefined(branch)) {
      throw new ServerError({
        message: 'BACKEND_BRANCH_ALREADY_EXISTS'
      });
    }
  }
}
