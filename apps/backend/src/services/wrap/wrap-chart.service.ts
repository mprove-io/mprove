import { Injectable } from '@nestjs/common';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class WrapChartService {
  constructor(
    private tabService: TabService,
    private hashService: HashService
  ) {}

  wrapToApiChart(item: {
    chart: ChartEnt;
    mconfigs: MconfigX[];
    queries: Query[];
    member: Member;
    isAddMconfigAndQuery: boolean;
    models: ModelX[];
  }): ChartX {
    let { chart, mconfigs, queries, member, isAddMconfigAndQuery, models } =
      item;

    let chartTab = this.tabService.decrypt<ChartTab>({
      encryptedString: chart.tab
    });

    let filePathArray = isDefined(chartTab.filePath)
      ? chartTab.filePath.split('/')
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
      title: chartTab.title,
      chartType: chart.chartType,
      modelId: chart.modelId,
      modelLabel: chartTab.modelLabel,
      filePath: chartTab.filePath,
      accessRoles: chartTab.accessRoles,
      tiles: makeTilesX({
        tiles: chartTab.tiles,
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

  wrapToEntityChart(item: {
    chart: Chart;
    chartType: ChartTypeEnum;
  }): ChartEnt {
    let { chart, chartType } = item;

    let chartTab: ChartTab = {
      title: chart.title,
      modelLabel: chart.modelLabel,
      filePath: chart.filePath,
      accessRoles: chart.accessRoles,
      tiles: chart.tiles
    };

    let chartEnt: ChartEnt = {
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
      tab: this.tabService.encrypt({ data: chartTab }),
      serverTs: chart.serverTs
    };

    return chartEnt;
  }
}
