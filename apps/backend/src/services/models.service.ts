import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';
import { BridgeEntity } from '~backend/models/store-entities/bridge.entity';

@Injectable()
export class ModelsService {
  constructor(private modelsRepository: repositories.ModelsRepository) {}

  async getModelCheckExists(item: { modelId: string; structId: string }) {
    let { modelId, structId } = item;

    let model = await this.modelsRepository.findOne({
      where: {
        struct_id: structId,
        model_id: modelId
      }
    });

    if (common.isUndefined(model)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MODEL_DOES_NOT_EXIST
      });
    }

    return model;
  }

  async getModelsY(item: {
    bridge: BridgeEntity;
    filterByModelIds: string[];
    addFields: boolean;
  }) {
    let { bridge, filterByModelIds, addFields } = item;

    let selectAr: (
      | 'struct_id'
      | 'model_id'
      | 'connection_id'
      | 'file_path'
      | 'content'
      | 'access_users'
      | 'access_roles'
      | 'label'
      | 'gr'
      | 'hidden'
      | 'fields'
      | 'nodes'
      | 'description'
      | 'server_ts'
    )[] = [
      'struct_id',
      'model_id',
      'connection_id',
      'file_path',
      'access_users',
      'access_roles',
      'label',
      'gr',
      'hidden',
      'nodes',
      'description'
    ];

    let where = { struct_id: bridge.struct_id };

    if (common.isDefined(filterByModelIds) && filterByModelIds.length > 0) {
      where = Object.assign(where, {
        model_id: In(filterByModelIds)
      });
    }

    if (addFields === true) {
      selectAr.push('fields');
    }

    let models = await this.modelsRepository.find({
      select: selectAr,
      where: where
    });

    return models;
  }
}
