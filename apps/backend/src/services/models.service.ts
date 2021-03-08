import { Injectable } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';

@Injectable()
export class ModelsService {
  constructor(private modelsRepository: repositories.ModelsRepository) {}

  async getModelCheckExists(item: { modelId: string; structId: string }) {
    let { modelId, structId } = item;

    let model = await this.modelsRepository.findOne({
      struct_id: structId,
      model_id: modelId
    });

    if (common.isUndefined(model)) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_MODEL_DOES_NOT_EXIST
      });
    }

    return model;
  }

  checkModelAccess(item: {
    userAlias: string;
    memberRoles: string[];
    model: entities.ModelEntity;
  }): boolean {
    let { userAlias, memberRoles, model } = item;

    if (model.access_roles.length === 0 && model.access_users.length === 0) {
      return true;
    }

    if (
      model.access_users.indexOf(userAlias) < 0 &&
      !model.access_roles.some(x => memberRoles.includes(x))
    ) {
      return false;
    }

    return true;
  }
}
