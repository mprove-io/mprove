import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { ChartEnt, chartsTable } from '~backend/drizzle/postgres/schema/charts';
import {
  ChartLt,
  ChartSt,
  ChartTab
} from '~backend/drizzle/postgres/tabs/chart-tab';
import { makeTilesX } from '~backend/functions/make-tiles-x';
import { MPROVE_USERS_FOLDER } from '~common/constants/top';
import { ChartTypeEnum } from '~common/enums/chart/chart-type.enum';
import { ErEnum } from '~common/enums/er.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { ChartX } from '~common/interfaces/backend/chart-x';
import { MconfigX } from '~common/interfaces/backend/mconfig-x';
import { Member } from '~common/interfaces/backend/member';
import { ModelX } from '~common/interfaces/backend/model-x';
import { Chart } from '~common/interfaces/blockml/chart';
import { Query } from '~common/interfaces/blockml/query';
import { ServerError } from '~common/models/server-error';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class ChartsService {
  constructor(
    private hashService: HashService,
    private tabService: TabService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  entToTab(chartEnt: ChartEnt): ChartTab {
    if (isUndefined(chartEnt)) {
      return;
    }

    let chart: ChartTab = {
      ...chartEnt,
      ...this.tabService.decrypt<ChartSt>({
        encryptedString: chartEnt.st
      }),
      ...this.tabService.decrypt<ChartLt>({
        encryptedString: chartEnt.lt
      })
    };

    return chart;
  }

  tabToApi(item: {
    chart: ChartTab;
    mconfigs: MconfigX[];
    queries: Query[];
    member: Member;
    isAddMconfigAndQuery: boolean;
    models: ModelX[];
  }): ChartX {
    let { chart, mconfigs, queries, member, isAddMconfigAndQuery, models } =
      item;

    let filePathArray = isDefined(chart.filePath)
      ? chart.filePath.split('/')
      : [];

    let usersFolderIndex = filePathArray.findIndex(
      x => x === MPROVE_USERS_FOLDER
    );

    let author =
      usersFolderIndex > -1 && filePathArray.length > usersFolderIndex + 1
        ? filePathArray[usersFolderIndex + 1]
        : undefined;

    let canEditOrDeleteChart =
      member.isEditor || member.isAdmin || author === member.alias;

    let apiChart: ChartX = {
      structId: chart.structId,
      chartId: chart.chartId,
      draft: chart.draft,
      creatorId: chart.creatorId,
      author: author,
      canEditOrDeleteChart: canEditOrDeleteChart,
      title: chart.title,
      chartType: chart.chartType,
      modelId: chart.modelId,
      modelLabel: chart.modelLabel,
      filePath: chart.filePath,
      accessRoles: chart.accessRoles,
      tiles: makeTilesX({
        tiles: chart.tiles,
        mconfigs: mconfigs,
        queries: queries,
        isAddMconfigAndQuery: isAddMconfigAndQuery,
        models: models,
        dashboardExtendedFilters: undefined
      }),
      serverTs: Number(chart.serverTs)
    };

    return apiChart;
  }

  apiToTab(item: {
    apiChart: Chart;
    chartType: ChartTypeEnum;
  }): ChartTab {
    let { apiChart, chartType } = item;

    let chart: ChartTab = {
      chartFullId: this.hashService.makeChartFullId({
        structId: apiChart.structId,
        chartId: apiChart.chartId
      }),
      structId: apiChart.structId,
      chartId: apiChart.chartId,
      modelId: apiChart.modelId,
      creatorId: apiChart.creatorId,
      chartType: chartType,
      draft: apiChart.draft,
      title: apiChart.title,
      modelLabel: apiChart.modelLabel,
      filePath: apiChart.filePath,
      accessRoles: apiChart.accessRoles,
      tiles: apiChart.tiles,
      serverTs: apiChart.serverTs
    };

    return chart;
  }

  async getChartCheckExists(item: {
    chartId: string;
    structId: string;
  }): Promise<ChartTab> {
    let { chartId, structId } = item;

    let chart = await this.db.drizzle.query.chartsTable
      .findFirst({
        where: and(
          eq(chartsTable.structId, structId),
          eq(chartsTable.chartId, chartId)
        )
      })
      .then(x => this.entToTab(x));

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
