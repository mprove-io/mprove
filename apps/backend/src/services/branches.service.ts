import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { branchesTable } from '~backend/drizzle/postgres/schema/branches';

@Injectable()
export class BranchesService {
  constructor(@Inject(DRIZZLE) private db: Db) {}

  async getBranchCheckExists(item: {
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

    if (isUndefined(branch)) {
      throw new ServerError({
        message: ErEnum.BACKEND_BRANCH_DOES_NOT_EXIST
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
        message: ErEnum.BACKEND_BRANCH_ALREADY_EXISTS
      });
    }
  }
}
