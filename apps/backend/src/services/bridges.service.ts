import { Injectable } from '@nestjs/common';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';

@Injectable()
export class BridgesService {
  constructor(private bridgesRepository: repositories.BridgesRepository) {}

  async getBridgeCheckExists(item: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
  }) {
    let { projectId, repoId, branchId, envId } = item;

    let bridge = await this.bridgesRepository.findOne({
      where: {
        project_id: projectId,
        repo_id: repoId,
        branch_id: branchId,
        env_id: envId
      }
    });

    if (common.isUndefined(bridge)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_BRIDGE_BRANCH_ENV_DOES_NOT_EXIST
      });
    }

    return bridge;
  }
}
