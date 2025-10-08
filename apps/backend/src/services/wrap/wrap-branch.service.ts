import { Injectable } from '@nestjs/common';
import { BranchEnt } from '~backend/drizzle/postgres/schema/branches';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class WrapBranchService {
  constructor(
    private tabService: TabService,
    private hashService: HashService
  ) {}

  makeBranch(item: {
    projectId: string;
    repoId: string;
    branchId: string;
  }): BranchEnt {
    let { projectId, repoId, branchId } = item;

    let branch: BranchEnt = {
      branchFullId: this.hashService.makeBranchFullId({
        projectId: projectId,
        repoId: repoId,
        branchId: branchId
      }),
      projectId: projectId,
      repoId: repoId,
      branchId: branchId,
      serverTs: undefined
    };

    return branch;
  }
}
