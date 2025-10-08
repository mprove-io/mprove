import { Injectable } from '@nestjs/common';
import { ChartEnt } from '~backend/drizzle/postgres/schema/charts';
import {
  ChartLt,
  ChartSt,
  ChartTab
} from '~backend/drizzle/postgres/tabs/chart-tab';
import { makeTilesX } from '~backend/functions/make-tiles-x';
import { MPROVE_USERS_FOLDER } from '~common/constants/top';
import { ChartTypeEnum } from '~common/enums/chart/chart-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { ChartX } from '~common/interfaces/backend/chart-x';
import { MconfigX } from '~common/interfaces/backend/mconfig-x';
import { Member } from '~common/interfaces/backend/member';
import { ModelX } from '~common/interfaces/backend/model-x';
import { Chart } from '~common/interfaces/blockml/chart';
import { Query } from '~common/interfaces/blockml/query';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class WrapChartService {
  constructor(
    private tabService: TabService,
    private hashService: HashService
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

    let filePathArray = isDefined(chart.st.filePath)
      ? chart.st.filePath.split('/')
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
      title: chart.st.title,
      chartType: chart.chartType,
      modelId: chart.modelId,
      modelLabel: chart.st.modelLabel,
      filePath: chart.st.filePath,
      accessRoles: chart.st.accessRoles,
      tiles: makeTilesX({
        tiles: chart.st.tiles,
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
    chart: Chart;
    chartType: ChartTypeEnum;
  }): ChartTab {
    let { chart, chartType } = item;

    let chartSt: ChartSt = {
      title: chart.title,
      modelLabel: chart.modelLabel,
      filePath: chart.filePath,
      accessRoles: chart.accessRoles,
      tiles: chart.tiles
    };

    let chartLt: ChartLt = {};

    let chartTab: ChartTab = {
      chartFullId: this.hashService.makeChartFullId({
        structId: chart.structId,
        chartId: chart.chartId
      }),
      structId: chart.structId,
      chartId: chart.chartId,
      draft: chart.draft,
      creatorId: chart.creatorId,
      chartType: chartType,
      modelId: chart.modelId,
      st: chartSt,
      lt: chartLt,
      serverTs: chart.serverTs
    };

    return chartTab;
  }

  tabToEnt(chart: ChartTab): ChartEnt {
    let chartEnt: ChartEnt = {
      ...chart,
      st: this.tabService.encrypt({ data: chart.st }),
      lt: this.tabService.encrypt({ data: chart.lt })
    };

    return chartEnt;
  }

  entToTab(chart: ChartEnt): ChartTab {
    let chartTab: ChartTab = {
      ...chart,
      st: this.tabService.decrypt<ChartSt>({
        encryptedString: chart.st
      }),
      lt: this.tabService.decrypt<ChartLt>({
        encryptedString: chart.lt
      })
    };

    return chartTab;
  }
}
