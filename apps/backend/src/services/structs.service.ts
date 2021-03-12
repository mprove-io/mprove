import { Injectable } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';

@Injectable()
export class StructsService {
  constructor(private structsRepository: repositories.StructsRepository) {}

  async getStructCheckExists(item: { structId: string }) {
    let { structId: structId } = item;

    let struct = await this.structsRepository.findOne({
      struct_id: structId
    });

    if (common.isUndefined(struct)) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_STRUCT_DOES_NOT_EXIST
      });
    }

    return struct;
  }
}
