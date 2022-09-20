import { Injectable } from '@nestjs/common';
import { Connection, In } from 'typeorm';
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
        message: common.ErEnum.BACKEND_STRUCT_DOES_NOT_EXIST
      });
    }

    return struct;
  }

  async removeOrphanedStructs() {
    let rawData: any;

    await this.connection.transaction(async manager => {
      rawData = await manager.query(`
SELECT 
  s.struct_id
FROM structs as s 
LEFT JOIN bridges as b ON s.struct_id=b.struct_id 
LEFT JOIN branches as c ON b.branch_id=c.branch_id 
WHERE c.branch_id is NULL AND s.server_ts < (NOW() - INTERVAL 10 MINUTE)
`);
    });

    let orphanedStructIds: string[] =
      rawData?.map((x: any) => x.struct_id) || [];

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
