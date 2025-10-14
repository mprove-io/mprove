import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { BranchTab } from '~backend/drizzle/postgres/schema/_tabs';
import {
  BranchEnt,
  branchesTable
} from '~backend/drizzle/postgres/schema/branches';
import { ErEnum } from '~common/enums/er.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { ServerError } from '~common/models/server-error';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class BranchesService {
  constructor(
    private tabService: TabService,
    private hashService: HashService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  entToTab(branchEnt: BranchEnt): BranchTab {
    if (isUndefined(branchEnt)) {
      return;
    }

    let branch: BranchTab = {
      ...branchEnt,
      ...this.tabService.getTabProps({ ent: branchEnt })
    };

    return branch;
  }

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
      .then(x => this.entToTab(x));

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
