import { Injectable } from '@nestjs/common';
import { ChartEnt } from '~backend/drizzle/postgres/schema/charts';
import { DashboardEnt } from '~backend/drizzle/postgres/schema/dashboards';
import { MconfigEnt } from '~backend/drizzle/postgres/schema/mconfigs';
import { ModelEnt } from '~backend/drizzle/postgres/schema/models';
import { QueryEnt } from '~backend/drizzle/postgres/schema/queries';
import { ReportEnt } from '~backend/drizzle/postgres/schema/reports';
import { ChartTypeEnum } from '~common/enums/chart/chart-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { Chart } from '~common/interfaces/blockml/chart';
import { Dashboard } from '~common/interfaces/blockml/dashboard';
import { Mconfig } from '~common/interfaces/blockml/mconfig';
import { Model } from '~common/interfaces/blockml/model';
import { Query } from '~common/interfaces/blockml/query';
import { Report } from '~common/interfaces/blockml/report';
import { HashService } from './hash.service';

@Injectable()
export class WrapToEntService {
  constructor(private hashService: HashService) {}

  // wrapToEntityApi(x: Api): ApiEnt {
  //   return {
  //     struct_id: x.structId,
  //     api_id: x.apiId,
  //     file_path: x.filePath,
  //     label: x.label,
  //     steps: x.steps,
  //     server_ts: x.serverTs.toString()
  //   };
  // }

  wrapToEntityDashboard(dashboard: Dashboard): DashboardEnt {
    return {
      dashboardFullId: this.hashService.makeDashboardFullId({
        structId: dashboard.structId,
        dashboardId: dashboard.dashboardId
      }),
      structId: dashboard.structId,
      dashboardId: dashboard.dashboardId,
      draft: dashboard.draft,
      creatorId: dashboard.creatorId,
      filePath: dashboard.filePath,
      content: dashboard.content,
      accessRoles: dashboard.accessRoles,
      title: dashboard.title,
      gr: dashboard.gr,
      hidden: dashboard.hidden,
      fields: dashboard.fields,
      tiles: dashboard.tiles,
      description: dashboard.description,
      serverTs: dashboard.serverTs
    };
  }

  wrapToEntityMconfig(mconfig: Mconfig): MconfigEnt {
    return {
      structId: mconfig.structId,
      queryId: mconfig.queryId,
      mconfigId: mconfig.mconfigId,
      modelId: mconfig.modelId,
      modelType: mconfig.modelType,
      // isStoreModel: mconfig.isStoreModel,
      dateRangeIncludesRightSide: mconfig.dateRangeIncludesRightSide,
      storePart: mconfig.storePart,
      modelLabel: mconfig.modelLabel,
      modelFilePath: mconfig.modelFilePath,
      malloyQueryStable: mconfig.malloyQueryStable,
      malloyQueryExtra: mconfig.malloyQueryExtra,
      compiledQuery: mconfig.compiledQuery,
      select: mconfig.select,
      // unsafeSelect: mconfig.unsafeSelect,
      // warnSelect: mconfig.warnSelect,
      // joinAggregations: mconfig.joinAggregations,
      sortings: mconfig.sortings,
      sorts: mconfig.sorts,
      timezone: mconfig.timezone,
      limit: mconfig.limit,
      filters: mconfig.filters,
      chart: mconfig.chart,
      temp: mconfig.temp,
      serverTs: mconfig.serverTs
    };
  }

  wrapToEntityModel(model: Model): ModelEnt {
    return {
      modelFullId: this.hashService.makeModelFullId({
        structId: model.structId,
        modelId: model.modelId
      }),
      structId: model.structId,
      modelId: model.modelId,
      type: model.type,
      source: model.source,
      malloyModelDef: model.malloyModelDef,
      connectionId: model.connectionId,
      filePath: model.filePath,
      fileText: model.fileText,
      content: model.content,
      isViewModel: model.isViewModel,
      // isStoreModel: model.isStoreModel,
      dateRangeIncludesRightSide: model.dateRangeIncludesRightSide,
      accessRoles: model.accessRoles,
      label: model.label,
      gr: model.gr,
      hidden: model.hidden,
      fields: model.fields,
      nodes: model.nodes,
      description: model.description,
      serverTs: model.serverTs
    };
  }

  wrapToEntityQuery(query: Query): QueryEnt {
    return {
      projectId: query.projectId,
      envId: query.envId,
      connectionId: query.connectionId,
      connectionType: query.connectionType,
      queryId: query.queryId,
      sql: query.sql,
      apiMethod: query.apiMethod,
      apiUrl: query.apiUrl,
      apiBody: query.apiBody,
      data: query.data,
      status: query.status,
      lastRunBy: query.lastRunBy,
      lastRunTs: query.lastRunTs,
      lastCancelTs: query.lastCancelTs,
      lastCompleteTs: query.lastCompleteTs,
      lastCompleteDuration: query.lastCompleteDuration,
      lastErrorMessage: query.lastErrorMessage,
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
      serverTs: query.serverTs
    };
  }

  wrapToEntityReport(report: Report): ReportEnt {
    return {
      reportFullId: this.hashService.makeReportFullId({
        structId: report.structId,
        reportId: report.reportId
      }),
      projectId: report.projectId,
      structId: report.structId,
      reportId: report.reportId,
      filePath: report.filePath,
      fields: report.fields,
      draft: report.draft,
      creatorId: report.creatorId,
      accessRoles: report.accessRoles,
      title: report.title,
      rows: report.rows,
      chart: report.chart,
      draftCreatedTs: report.draftCreatedTs,
      serverTs: report.serverTs
    };
  }

  wrapToEntityChart(item: {
    chart: Chart;
    chartType: ChartTypeEnum;
  }): ChartEnt {
    let { chart, chartType } = item;

    return {
      chartFullId: this.hashService.makeChartFullId({
        structId: chart.structId,
        chartId: chart.chartId
      }),
      structId: chart.structId,
      chartId: chart.chartId,
      draft: chart.draft,
      creatorId: chart.creatorId,
      title: chart.title,
      chartType: chartType,
      modelId: chart.modelId,
      modelLabel: chart.modelLabel,
      filePath: chart.filePath,
      accessRoles: chart.accessRoles,
      gr: chart.gr,
      hidden: chart.hidden,
      tiles: chart.tiles,
      serverTs: chart.serverTs
    };
  }
}
