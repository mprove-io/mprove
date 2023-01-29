import { Injectable } from '@nestjs/common';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';

@Injectable()
export class RepsService {
  constructor(private repsRepository: repositories.RepsRepository) {}

  async getRepCheckExists(item: { repId: string; structId: string }) {
    let { repId, structId } = item;

    let rep = await this.repsRepository.findOne({
      where: {
        struct_id: structId,
        rep_id: repId
      }
    });

    if (common.isUndefined(rep)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_REP_DOES_NOT_EXIST
      });
    }

    return rep;
  }

  checkRepPath(item: { filePath: string; userAlias: string }) {
    if (item.filePath.split('/')[2] !== item.userAlias) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_FORBIDDEN_REP_PATH
      });
    }
  }
}
