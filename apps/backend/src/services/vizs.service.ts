import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { common } from '~backend/barrels/common';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { vizsTable } from '~backend/drizzle/postgres/schema/vizs';

@Injectable()
export class VizsService {
  constructor(@Inject(DRIZZLE) private db: Db) {}

  async getVizCheckExists(item: { vizId: string; structId: string }) {
    let { vizId, structId } = item;

    // let viz = await this.vizsRepository.findOne({
    //   where: {
    //     struct_id: structId,
    //     viz_id: vizId
    //   }
    // });

    let viz = await this.db.drizzle.query.vizsTable.findFirst({
      where: and(eq(vizsTable.structId, structId), eq(vizsTable.vizId, vizId))
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
