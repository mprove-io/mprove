import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  ChartTab,
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { chartsTable } from '#backend/drizzle/postgres/schema/charts';
import { makeTilesX } from '#backend/functions/make-tiles-x';
import { MPROVE_USERS_FOLDER } from '#common/constants/top';
import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
import { ErEnum } from '#common/enums/er.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { ServerError } from '#common/models/server-error';
import type { ChartX } from '#common/zod/backend/chart-x';
import type { MconfigX } from '#common/zod/backend/mconfig-x';
import type { Member } from '#common/zod/backend/member';
import type { ModelX } from '#common/zod/backend/model-x';
import type { Chart } from '#common/zod/blockml/chart';
import type { Query } from '#common/zod/blockml/query';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class ChartsService {
  constructor(
    private hashService: HashService,
    private tabService: TabService,
    @Inject(DRIZZLE) private db: Db
  ) {}

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

  apiToTab(item: { apiChart: Chart; chartType: ChartTypeEnum }): ChartTab {
    let { apiChart, chartType } = item;

    if (isUndefined(apiChart)) {
      return;
    }

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
      isExplorer: apiChart.isExplorer,
      sessionId: apiChart.sessionId,
      chartYaml: apiChart.chartYaml,
      title: apiChart.title,
      modelLabel: apiChart.modelLabel,
      filePath: apiChart.filePath,
      tiles: apiChart.tiles,
      keyTag: undefined,
      serverTs: apiChart.serverTs
    };

    return chart;
  }

  async getChartCheckExists(item: {
    chartId: string;
    structId: string;
    userMember: MemberTab;
    user: UserTab;
  }): Promise<ChartTab> {
    let { chartId, structId, userMember, user } = item;

    let chart = await this.db.drizzle.query.chartsTable
      .findFirst({
        where: and(
          eq(chartsTable.structId, structId),
          eq(chartsTable.chartId, chartId)
        )
      })
      .then(x => this.tabService.chartEntToTab(x));

    if (isUndefined(chart)) {
      throw new ServerError({
        message: ErEnum.BACKEND_CHART_DOES_NOT_EXIST
      });
    }

    if (chart.draft === true && chart.creatorId !== user.userId) {
      throw new ServerError({
        message: ErEnum.BACKEND_CHART_CREATOR_ID_MISMATCH
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
