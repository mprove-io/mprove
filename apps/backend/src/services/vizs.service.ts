import { Injectable } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';

@Injectable()
export class VizsService {
  constructor(private vizsRepository: repositories.VizsRepository) {}

  async getVizCheckExists(item: { vizId: string; structId: string }) {
    let { vizId, structId } = item;

    let viz = await this.vizsRepository.findOne({
      struct_id: structId,
      viz_id: vizId
    });

    if (common.isUndefined(viz)) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_VIZ_DOES_NOT_EXIST
      });
    }

    return viz;
  }

  checkVizPath(item: { filePath: string; userAlias: string }) {
    if (
      item.filePath.split('/')[1] !== common.BLOCKML_USERS_FOLDER ||
      item.filePath.split('/')[2] !== item.userAlias
    ) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_FORBIDDEN_VIZ_PATH
      });
    }
  }
}
