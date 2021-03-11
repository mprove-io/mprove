import { Injectable } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';

@Injectable()
export class MconfigsService {
  constructor(private mconfigsRepository: repositories.MconfigsRepository) {}

  async getMconfigCheckExists(item: { mconfigId: string }) {
    let { mconfigId } = item;

    let mconfig = await this.mconfigsRepository.findOne({
      mconfig_id: mconfigId
    });

    if (common.isUndefined(mconfig)) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_MCONFIG_DOES_NOT_EXIST
      });
    }

    return mconfig;
  }
}
