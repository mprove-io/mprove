import { Injectable } from '@nestjs/common';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';

@Injectable()
export class MconfigsService {
  constructor(private mconfigsRepository: repositories.MconfigsRepository) {}

  async getMconfigCheckExists(item: { mconfigId: string; structId: string }) {
    let { mconfigId, structId } = item;

    let mconfig = await this.mconfigsRepository.findOne({
      mconfig_id: mconfigId,
      struct_id: structId
    });

    if (common.isUndefined(mconfig)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MCONFIG_DOES_NOT_EXIST
      });
    }

    return mconfig;
  }
}
