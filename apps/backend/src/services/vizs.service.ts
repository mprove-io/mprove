import { Injectable } from '@nestjs/common';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';

@Injectable()
export class VizsService {
  constructor(private vizsRepository: repositories.VizsRepository) {}

  async getVizCheckExists(item: { vizId: string; structId: string }) {
    let { vizId, structId } = item;

    let viz = await this.vizsRepository.findOne({
      where: {
        struct_id: structId,
        viz_id: vizId
      }
    });

    if (common.isUndefined(viz)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_VIS_DOES_NOT_EXIST
      });
    }

    return viz;
  }

  checkVizPath(item: { filePath: string; userAlias: string }) {
    let filePathArray = item.filePath.split('/');

    let usersFolderIndex = filePathArray.findIndex(
      x => x === common.MPROVE_USERS_FOLDER
    );

    if (
      usersFolderIndex < 0 ||
      filePathArray.length === usersFolderIndex + 1 ||
      filePathArray[usersFolderIndex + 1] !== item.userAlias
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_FORBIDDEN_VIS_PATH
      });
    }
  }
}
