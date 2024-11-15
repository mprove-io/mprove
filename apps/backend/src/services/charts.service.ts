import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { common } from '~backend/barrels/common';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { chartsTable } from '~backend/drizzle/postgres/schema/charts';

@Injectable()
export class ChartsService {
  constructor(@Inject(DRIZZLE) private db: Db) {}

  async getChartCheckExists(item: { chartId: string; structId: string }) {
    let { chartId, structId } = item;

    let chart = await this.db.drizzle.query.chartsTable.findFirst({
      where: and(
        eq(chartsTable.structId, structId),
        eq(chartsTable.chartId, chartId)
      )
    });

    // let viz = await this.vizsRepository.findOne({
    //   where: {
    //     struct_id: structId,
    //     viz_id: chartId
    //   }
    // });

    if (common.isUndefined(chart)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_CHART_DOES_NOT_EXIST
      });
    }

    return chart;
  }

  checkChartPath(item: { filePath: string; userAlias: string }) {
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
        message: common.ErEnum.BACKEND_FORBIDDEN_CHART_PATH
      });
    }
  }
}
