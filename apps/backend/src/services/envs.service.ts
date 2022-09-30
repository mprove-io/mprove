import { Injectable } from '@nestjs/common';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';
import { MemberEntity } from '~backend/models/store-entities/_index';

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

  async getEnvCheckExistsAndAccess(item: {
    projectId: string;
    envId: string;
    member: MemberEntity;
  }) {
    let { projectId, envId, member } = item;

    let env = await this.envsRepository.findOne({
      env_id: envId,
      project_id: projectId
    });

    if (common.isUndefined(env)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_ENV_DOES_NOT_EXIST
      });
    }

    if (
      envId !== common.PROJECT_ENV_PROD &&
      member.is_admin === common.BoolEnum.FALSE &&
      member.envs.indexOf(envId) < 0
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MEMBER_DOES_NOT_HAVE_ACCESS_TO_ENV
      });
    }

    return env;
  }
}
