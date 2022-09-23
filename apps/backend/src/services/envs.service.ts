import { Injectable } from '@nestjs/common';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';

@Injectable()
export class EnvsService {
  constructor(private envsRepository: repositories.EnvsRepository) {}

  async checkEnvDoesNotExist(item: { projectId: string; envId: string }) {
    let { projectId, envId } = item;

    let env = await this.envsRepository.findOne({
      env_id: envId,
      project_id: projectId
    });

    if (common.isDefined(env)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_ENV_ALREADY_EXISTS
      });
    }
  }

  async getEnvCheckExists(item: { projectId: string; envId: string }) {
    let { projectId, envId } = item;

    let env = await this.envsRepository.findOne({
      env_id: envId,
      project_id: projectId
    });

    if (common.isUndefined(env)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_ENV_DOES_NOT_EXIST
      });
    }

    return env;
  }
}
