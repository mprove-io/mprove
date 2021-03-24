import { Injectable } from '@nestjs/common';
import { Connection, In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';

@Injectable()
export class StructsService {
  constructor(
    private structsRepository: repositories.StructsRepository,
    private dashboardsRepository: repositories.DashboardsRepository,
    private mconfigsRepository: repositories.MconfigsRepository,
    private modelsRepository: repositories.ModelsRepository,
    private vizsRepository: repositories.VizsRepository,
    private connection: Connection
  ) {}

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

  async removeOrphanedStructs() {
    let rawData;

    await this.connection.transaction(async manager => {
      rawData = await manager.query(`
SELECT 
  s.struct_id
FROM structs as s 
LEFT JOIN branches as b ON s.struct_id=b.struct_id 
WHERE b.branch_id is NULL
`);
    });

    let orphanedStructIds = rawData.map(x => x.struct_id);

    if (orphanedStructIds.length > 0) {
      await this.structsRepository.delete({ struct_id: In(orphanedStructIds) });
      await this.vizsRepository.delete({ struct_id: In(orphanedStructIds) });
      await this.modelsRepository.delete({ struct_id: In(orphanedStructIds) });
      await this.mconfigsRepository.delete({
        struct_id: In(orphanedStructIds)
      });
      await this.dashboardsRepository.delete({
        struct_id: In(orphanedStructIds)
      });
    }
  }
}
