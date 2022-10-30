import { Injectable } from '@nestjs/common';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';

@Injectable()
export class BranchesService {
  constructor(private branchesRepository: repositories.BranchesRepository) {}

  async getBranchCheckExists(item: {
    projectId: string;
    repoId: string;
    branchId: string;
  }) {
    let { projectId, repoId, branchId } = item;

    let branch = await this.branchesRepository.findOne({
      where: {
        project_id: projectId,
        repo_id: repoId,
        branch_id: branchId
      }
    });

    if (common.isUndefined(branch)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_BRANCH_DOES_NOT_EXIST
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

    let branch = await this.branchesRepository.findOne({
      where: {
        project_id: projectId,
        repo_id: repoId,
        branch_id: branchId
      }
    });

    if (common.isDefined(branch)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_BRANCH_ALREADY_EXISTS
      });
    }
  }
}
