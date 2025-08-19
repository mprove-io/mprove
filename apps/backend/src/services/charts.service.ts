import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

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

    if (isUndefined(chart)) {
      throw new ServerError({
        message: ErEnum.BACKEND_CHART_DOES_NOT_EXIST
      });
    }

    return chart;
  }

  checkChartPath(item: { filePath: string; userAlias: string }) {
    let filePathArray = item.filePath.split('/');

    let usersFolderIndex = filePathArray.findIndex(
      x => x === MPROVE_USERS_FOLDER
    );

    if (
      usersFolderIndex < 0 ||
      filePathArray.length === usersFolderIndex + 1 ||
      filePathArray[usersFolderIndex + 1] !== item.userAlias
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_FORBIDDEN_CHART_PATH
      });
    }
  }
}
