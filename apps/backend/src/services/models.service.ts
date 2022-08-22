import { Injectable } from '@nestjs/common';
import { common } from '~backend/barrels/common';
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
        message: common.ErEnum.BACKEND_MODEL_DOES_NOT_EXIST
      });
    }

    return model;
  }
}
