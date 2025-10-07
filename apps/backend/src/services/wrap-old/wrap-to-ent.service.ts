import { Injectable } from '@nestjs/common';
import { ModelLt, ModelSt } from '~backend/drizzle/postgres/enx/model-enx';
import { ChartEnt } from '~backend/drizzle/postgres/schema/charts';
import { DashboardEnt } from '~backend/drizzle/postgres/schema/dashboards';
import { MconfigEnt } from '~backend/drizzle/postgres/schema/mconfigs';
import { ModelEnt } from '~backend/drizzle/postgres/schema/models';
import { QueryEnt } from '~backend/drizzle/postgres/schema/queries';
import { ReportEnt } from '~backend/drizzle/postgres/schema/reports';
import { ChartTypeEnum } from '~common/enums/chart/chart-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { ChartTab } from '~common/interfaces/backend/chart-tab';
import { DashboardTab } from '~common/interfaces/backend/dashboard-tab';
import { MconfigTab } from '~common/interfaces/backend/mconfig-tab';
import { QueryTab } from '~common/interfaces/backend/query-tab';
import { ReportTab } from '~common/interfaces/backend/report-tab';
import { Chart } from '~common/interfaces/blockml/chart';
import { Dashboard } from '~common/interfaces/blockml/dashboard';
import { Mconfig } from '~common/interfaces/blockml/mconfig';
import { Model } from '~common/interfaces/blockml/model';
import { Query } from '~common/interfaces/blockml/query';
import { Report } from '~common/interfaces/blockml/report';
import { HashService } from './hash.service';
import { TabService } from './tab.service';

@Injectable()
export class WrapToEntService {
  constructor(
    private tabService: TabService,
    private hashService: HashService
  ) {}

  wrapToEntityModel(item: { model: Model }): ModelEnt {
    let { model } = item;

    let modelSt: ModelSt = {
      accessRoles: model.accessRoles
    };

    let modelLt: ModelLt = {
      source: model.source,
      malloyModelDef: model.malloyModelDef,
      filePath: model.filePath,
      fileText: model.fileText,
      storeContent: model.storeContent,
      dateRangeIncludesRightSide: model.dateRangeIncludesRightSide,
      label: model.label,
      fields: model.fields,
      nodes: model.nodes
    };

    let modelEnt: ModelEnt = {
      modelFullId: this.hashService.makeModelFullId({
        structId: model.structId,
        modelId: model.modelId
      }),
      structId: model.structId,
      modelId: model.modelId,
      type: model.type,
      connectionId: model.connectionId,
      connectionType: model.connectionType,
      st: this.tabService.encrypt({ data: modelSt }),
      lt: this.tabService.encrypt({ data: modelLt }),
      serverTs: model.serverTs
    };

    return modelEnt;
  }

  wrapToEntityDashboard(item: { dashboard: Dashboard }): DashboardEnt {
    let { dashboard } = item;

    let dashboardTab: DashboardTab = {
      filePath: dashboard.filePath,
      content: dashboard.content,
      accessRoles: dashboard.accessRoles,
      title: dashboard.title,
      fields: dashboard.fields,
      tiles: dashboard.tiles
    };

    let dashboardEnt: DashboardEnt = {
      dashboardFullId: this.hashService.makeDashboardFullId({
        structId: dashboard.structId,
        dashboardId: dashboard.dashboardId
      }),
      structId: dashboard.structId,
      dashboardId: dashboard.dashboardId,
      draft: dashboard.draft,
      creatorId: dashboard.creatorId,
      tab: this.tabService.encrypt({ data: dashboardTab }),
      serverTs: dashboard.serverTs
    };

    return dashboardEnt;
  }

  wrapToEntityMconfig(item: { mconfig: Mconfig }): MconfigEnt {
    let { mconfig } = item;

    let mconfigTab: MconfigTab = {
      dateRangeIncludesRightSide: mconfig.dateRangeIncludesRightSide,
      storePart: mconfig.storePart,
      modelLabel: mconfig.modelLabel,
      modelFilePath: mconfig.modelFilePath,
      malloyQueryStable: mconfig.malloyQueryStable,
      malloyQueryExtra: mconfig.malloyQueryExtra,
      compiledQuery: mconfig.compiledQuery,
      select: mconfig.select,
      sortings: mconfig.sortings,
      sorts: mconfig.sorts,
      timezone: mconfig.timezone,
      limit: mconfig.limit,
      filters: mconfig.filters,
      chart: mconfig.chart
    };

    let mconfigEnt: MconfigEnt = {
      structId: mconfig.structId,
      queryId: mconfig.queryId,
      mconfigId: mconfig.mconfigId,
      modelId: mconfig.modelId,
      modelType: mconfig.modelType,
      temp: mconfig.temp,
      tab: this.tabService.encrypt({ data: mconfigTab }),
      serverTs: mconfig.serverTs
    };

    return mconfigEnt;
  }

  wrapToEntityQuery(item: { query: Query }): QueryEnt {
    let { query } = item;

    let queryTab: QueryTab = {
      sql: query.sql,
      apiMethod: query.apiMethod,
      apiUrl: query.apiUrl,
      apiBody: query.apiBody,
      data: query.data,
      lastErrorMessage: query.lastErrorMessage
    };

    let queryEnt: QueryEnt = {
      projectId: query.projectId,
      envId: query.envId,
      connectionId: query.connectionId,
      connectionType: query.connectionType,
      queryId: query.queryId,
      status: query.status,
      lastRunBy: query.lastRunBy,
      lastRunTs: query.lastRunTs,
      lastCancelTs: query.lastCancelTs,
      lastCompleteTs: query.lastCompleteTs,
      lastCompleteDuration: query.lastCompleteDuration,
      lastErrorTs: query.lastErrorTs,
      queryJobId: undefined, // null
      bigqueryQueryJobId: undefined, // null
      bigqueryConsecutiveErrorsGetJob: isDefined(
        query.bigqueryConsecutiveErrorsGetJob
      )
        ? query.bigqueryConsecutiveErrorsGetJob
        : 0,
      bigqueryConsecutiveErrorsGetResults: isDefined(
        query.bigqueryConsecutiveErrorsGetResults
      )
        ? query.bigqueryConsecutiveErrorsGetResults
        : 0,
      apiUrlHash: this.hashService.makeHash(query.apiUrl),
      tab: this.tabService.encrypt({ data: queryTab }),
      serverTs: query.serverTs
    };

    return queryEnt;
  }

  wrapToEntityReport(item: { report: Report }): ReportEnt {
    let { report } = item;

    let reportTab: ReportTab = {
      filePath: report.filePath,
      fields: report.fields,
      accessRoles: report.accessRoles,
      title: report.title,
      rows: report.rows,
      chart: report.chart
    };

    let reportEnt: ReportEnt = {
      reportFullId: this.hashService.makeReportFullId({
        structId: report.structId,
        reportId: report.reportId
      }),
      projectId: report.projectId,
      structId: report.structId,
      reportId: report.reportId,
      creatorId: report.creatorId,
      draft: report.draft,
      draftCreatedTs: report.draftCreatedTs,
      tab: this.tabService.encrypt({ data: reportTab }),
      serverTs: report.serverTs
    };

    return reportEnt;
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
