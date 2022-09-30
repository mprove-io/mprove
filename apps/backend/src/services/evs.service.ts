import { Injectable } from '@nestjs/common';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';

@Injectable()
export class EvsService {
  constructor(private evsRepository: repositories.EvsRepository) {}

  async checkEvDoesNotExist(item: {
    projectId: string;
    envId: string;
    evId: string;
  }) {
    let { projectId, envId, evId } = item;

    let ev = await this.evsRepository.findOne({
      project_id: projectId,
      env_id: envId,
      ev_id: evId
    });

    if (common.isDefined(ev)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_ENV_ALREADY_EXISTS
      });
    }
  }

  async getEvCheckExists(item: {
    projectId: string;
    envId: string;
    evId: string;
  }) {
    let { projectId, envId, evId } = item;

    let ev = await this.evsRepository.findOne({
      project_id: projectId,
      env_id: envId,
      ev_id: evId
    });

    if (common.isUndefined(ev)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_EV_DOES_NOT_EXIST
      });
    }

    return ev;
  }
}
