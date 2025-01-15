import { Injectable } from '@nestjs/common';
import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { HashService } from './hash.service';

@Injectable()
export class WrapToEntService {
  constructor(private hashService: HashService) {}

  // wrapToEntityApi(x: common.Api): schemaPostgres.ApiEnt {
  //   return {
  //     struct_id: x.structId,
  //     api_id: x.apiId,
  //     file_path: x.filePath,
  //     label: x.label,
  //     steps: x.steps,
  //     server_ts: x.serverTs.toString()
  //   };
  // }

  wrapToEntityDashboard(
    dashboard: common.Dashboard
  ): schemaPostgres.DashboardEnt {
    return {
      dashboardFullId: this.hashService.makeDashboardFullId({
        structId: dashboard.structId,
        dashboardId: dashboard.dashboardId
      }),
      structId: dashboard.structId,
      dashboardId: dashboard.dashboardId,
      filePath: dashboard.filePath,
      content: dashboard.content,
      accessUsers: dashboard.accessUsers,
      accessRoles: dashboard.accessRoles,
      title: dashboard.title,
      gr: dashboard.gr,
      hidden: dashboard.hidden,
      fields: dashboard.fields,
      tiles: dashboard.tiles,
      temp: dashboard.temp,
      description: dashboard.description,
      serverTs: dashboard.serverTs
    };
  }

  wrapToEntityMconfig(mconfig: common.Mconfig): schemaPostgres.MconfigEnt {
    return {
      structId: mconfig.structId,
      queryId: mconfig.queryId,
      mconfigId: mconfig.mconfigId,
      modelId: mconfig.modelId,
      modelLabel: mconfig.modelLabel,
      select: mconfig.select,
      unsafeSelect: mconfig.unsafeSelect,
      warnSelect: mconfig.warnSelect,
      joinAggregations: mconfig.joinAggregations,
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

  wrapToEntityMetric(metric: common.MetricAny): schemaPostgres.MetricEnt {
    return {
      metricFullId: this.hashService.makeMetricFullId({
        structId: metric.structId,
        metricId: metric.metricId
      }),
      structId: metric.structId,
      type: metric.type,
      filePath: metric.filePath,
      metricId: metric.metricId,
      partId: metric.partId,
      topNode: metric.topNode,
      topLabel: metric.topLabel,
      params: metric.params,
      modelId: metric.modelId,
      fieldId: metric.fieldId,
      fieldClass: metric.fieldClass,
      timefieldId: metric.timeFieldId,
      // api_id: metric.apiId,
      formula: metric.formula,
      sql: metric.sql,
      connectionId: metric.connection,
      label: metric.label,
      partNodeLabel: metric.partNodeLabel,
      partFieldLabel: metric.partFieldLabel,
      partLabel: metric.partLabel,
      timeNodeLabel: metric.timeNodeLabel,
      timeFieldLabel: metric.timeFieldLabel,
      timeLabel: metric.timeLabel,
      description: metric.description,
      formatNumber: metric.formatNumber,
      currencyPrefix: metric.currencyPrefix,
      currencySuffix: metric.currencySuffix,
      serverTs: metric.serverTs
    };
  }

  wrapToEntityModel(model: common.Model): schemaPostgres.ModelEnt {
    return {
      modelFullId: this.hashService.makeModelFullId({
        structId: model.structId,
        modelId: model.modelId
      }),
      structId: model.structId,
      modelId: model.modelId,
      connectionId: model.connectionId,
      filePath: model.filePath,
      content: model.content,
      isViewModel: model.isViewModel,
      accessUsers: model.accessUsers,
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

  wrapToEntityQuery(query: common.Query): schemaPostgres.QueryEnt {
    return {
      projectId: query.projectId,
      envId: query.envId,
      connectionId: query.connectionId,
      connectionType: query.connectionType,
      queryId: query.queryId,
      sql: query.sql,
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
      bigqueryConsecutiveErrorsGetJob: common.isDefined(
        query.bigqueryConsecutiveErrorsGetJob
      )
        ? query.bigqueryConsecutiveErrorsGetJob
        : 0,
      bigqueryConsecutiveErrorsGetResults: common.isDefined(
        query.bigqueryConsecutiveErrorsGetResults
      )
        ? query.bigqueryConsecutiveErrorsGetResults
        : 0,
      serverTs: query.serverTs
    };
  }

  wrapToEntityReport(report: common.Report): schemaPostgres.ReportEnt {
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
      accessUsers: report.accessUsers,
      accessRoles: report.accessRoles,
      title: report.title,
      rows: report.rows,
      chart: report.chart,
      draftCreatedTs: report.draftCreatedTs,
      serverTs: report.serverTs
    };
  }

  wrapToEntityChart(chart: common.Chart): schemaPostgres.ChartEnt {
    return {
      chartFullId: this.hashService.makeChartFullId({
        structId: chart.structId,
        chartId: chart.chartId
      }),
      structId: chart.structId,
      chartId: chart.chartId,
      title: chart.title,
      modelId: chart.modelId,
      modelLabel: chart.modelLabel,
      filePath: chart.filePath,
      accessUsers: chart.accessUsers,
      accessRoles: chart.accessRoles,
      gr: chart.gr,
      hidden: chart.hidden,
      tiles: chart.tiles,
      serverTs: chart.serverTs
    };
  }
}
