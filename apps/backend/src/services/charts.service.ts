import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { ChartEnx, chartsTable } from '~backend/drizzle/postgres/schema/charts';
import { MPROVE_USERS_FOLDER } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { isUndefined } from '~common/functions/is-undefined';
import { ChartTab } from '~common/interfaces/backend/chart-tab';
import { ServerError } from '~common/models/server-error';
import { TabService } from './tab.service';

@Injectable()
export class ChartsService {
  constructor(
    private tabService: TabService,
    @Inject(DRIZZLE) private db: Db
  ) {}

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

    let chartTab = this.tabService.decrypt<ChartTab>({
      encryptedString: chart.tab
    });

    let chartEnx: ChartEnx = {
      ...chart,
      tab: chartTab
    };

    return chartEnx;
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
