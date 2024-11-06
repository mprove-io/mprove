import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { common } from '~backend/barrels/common';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { mconfigsTable } from '~backend/drizzle/postgres/schema/mconfigs';

@Injectable()
export class MconfigsService {
  constructor(
    // private mconfigsRepository: repositories.MconfigsRepository,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getMconfigCheckExists(item: { mconfigId: string; structId: string }) {
    let { mconfigId, structId } = item;

    let mconfig = await this.db.drizzle.query.mconfigsTable.findFirst({
      where: and(
        eq(mconfigsTable.mconfigId, mconfigId),
        eq(mconfigsTable.structId, structId)
      )
    });

    // let mconfig = await this.mconfigsRepository.findOne({
    //   where: {
    //     mconfig_id: mconfigId,
    //     struct_id: structId
    //   }
    // });

    if (common.isUndefined(mconfig)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MCONFIG_DOES_NOT_EXIST
      });
    }

    return mconfig;
  }
}
