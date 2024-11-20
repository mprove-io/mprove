import { Injectable } from '@nestjs/common';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { makeDashboardFiltersX } from '~backend/functions/make-dashboard-filters-x';
import { makeFullName } from '~backend/functions/make-full-name';
import { makeMconfigFields } from '~backend/functions/make-mconfig-fields';
import { makeMconfigFiltersX } from '~backend/functions/make-mconfig-filters-x';
import { makeTilesX } from '~backend/functions/make-tiles-x';

@Injectable()
export class WrapToApiService {
  constructor() {}

  // wrapToApiApi(item: { api: schemaPostgres.ApiEnt }): common.Api {
  //   let { api } = item;

  //   return {
  //     structId: api.structId,
  //     apiId: api.apiId,
  //     filePath: api.filePath,
  //     label: api.label,
  //     steps: api.steps,
  //     serverTs: Number(api.serverTs)
  //   };
  // }

  wrapToApiConnection(x: schemaPostgres.ConnectionEnt): common.Connection {
    return {
      projectId: x.projectId,
      connectionId: x.connectionId,
      envId: x.envId,
      type: x.type,
      bigqueryProject: x.bigqueryProject,
      bigqueryClientEmail: x.bigqueryClientEmail,
      bigqueryQuerySizeLimitGb: x.bigqueryQuerySizeLimitGb,
      account: x.account,
      warehouse: x.warehouse,
      host: x.host,
      port: x.port,
      database: x.database,
      username: x.username,
      isSSL: x.isSsl,
      serverTs: x.serverTs
    };
  }

  wrapToApiDashboard(item: {
    dashboard: schemaPostgres.DashboardEnt;
    mconfigs: common.MconfigX[];
    queries: common.Query[];
    member: common.Member;
    isAddMconfigAndQuery: boolean;
    models: common.ModelX[];
  }): common.DashboardX {
    let { dashboard, mconfigs, queries, isAddMconfigAndQuery, member, models } =
      item;

    let filePathArray = dashboard.filePath.split('/');

    let usersFolderIndex = filePathArray.findIndex(
      x => x === common.MPROVE_USERS_FOLDER
    );

    let author =
      usersFolderIndex > -1 && filePathArray.length > usersFolderIndex + 1
        ? filePathArray[usersFolderIndex + 1]
        : undefined;

    let canEditOrDeleteDashboard =
      member.isEditor || member.isAdmin || author === member.alias;

    let dashboardExtendedFilters = makeDashboardFiltersX(dashboard);

    return {
      structId: dashboard.structId,
      dashboardId: dashboard.dashboardId,
      author: author,
      canEditOrDeleteDashboard: canEditOrDeleteDashboard,
      filePath: dashboard.filePath,
      content: dashboard.content,
      accessUsers: dashboard.accessUsers,
      accessRoles: dashboard.accessRoles,
      title: dashboard.title,
      gr: dashboard.gr,
      hidden: dashboard.hidden,
      fields: dashboard.fields,
      extendedFilters: dashboardExtendedFilters,
      description: dashboard.description,
      tiles: makeTilesX({
        tiles: dashboard.tiles,
        mconfigs: mconfigs,
        queries: queries,
        isAddMconfigAndQuery: isAddMconfigAndQuery,
        models: models,
        dashboardExtendedFilters: dashboardExtendedFilters
      }),
      temp: dashboard.temp,
      serverTs: dashboard.serverTs
    };
  }

  wrapToApiEnv(item: {
    env: schemaPostgres.EnvEnt;
    envConnectionIds: string[];
    envMembers: schemaPostgres.MemberEnt[];
  }): common.Env {
    let { env, envConnectionIds, envMembers } = item;

    let envUsers: common.EnvUser[] = [];

    envMembers.forEach(x => {
      let envUser: common.EnvUser = {
        alias: x.alias,
        firstName: x.firstName,
        lastName: x.lastName,
        fullName: makeFullName({
          firstName: x.firstName,
          lastName: x.lastName
        })
      };

      envUsers.push(envUser);
    });

    return {
      projectId: env.projectId,
      envId: env.envId,
      envConnectionIds: envConnectionIds,
      envUsers: envUsers
    };
  }

  wrapToApiEnvsItem(env: schemaPostgres.EnvEnt): common.EnvsItem {
    return {
      projectId: env.projectId,
      envId: env.envId
    };
  }

  wrapToApiEv(ev: schemaPostgres.EvEnt): common.Ev {
    return {
      projectId: ev.projectId,
      envId: ev.envId,
      evId: ev.evId,
      val: ev.val
    };
  }

  wrapToApiMconfig(item: {
    mconfig: schemaPostgres.MconfigEnt;
    modelFields: common.ModelField[];
  }): common.MconfigX {
    let { mconfig, modelFields } = item;

    return {
      structId: mconfig.structId,
      mconfigId: mconfig.mconfigId,
      queryId: mconfig.queryId,
      modelId: mconfig.modelId,
      modelLabel: mconfig.modelLabel,
      select: mconfig.select,
      unsafeSelect: mconfig.unsafeSelect,
      warnSelect: mconfig.warnSelect,
      joinAggregations: mconfig.joinAggregations,
      fields: makeMconfigFields({
        modelFields: modelFields,
        select: mconfig.select,
        sortings: mconfig.sortings,
        chart: mconfig.chart
      }),
      extendedFilters: makeMconfigFiltersX({
        modelFields: modelFields,
        mconfigFilters: mconfig.filters
      }),
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

  wrapToApiMember(x: schemaPostgres.MemberEnt): common.Member {
    return {
      projectId: x.projectId,
      memberId: x.memberId,
      email: x.email,
      alias: x.alias,
      firstName: x.firstName,
      lastName: x.lastName,
      fullName: makeFullName({ firstName: x.firstName, lastName: x.lastName }),
      avatarSmall: undefined,
      timezone: x.timezone,
      isAdmin: x.isAdmin,
      isEditor: x.isEditor,
      isExplorer: x.isExplorer,
      roles: x.roles,
      envs: x.envs,
      serverTs: x.serverTs
    };
  }

  wrapToApiMetric(item: {
    metric: schemaPostgres.MetricEnt;
    // hasAccess: boolean;
  }): common.MetricAny {
    let {
      metric
      // , hasAccess
    } = item;

    return {
      structId: metric.structId,
      type: metric.type,
      filePath: metric.filePath,
      metricId: metric.metricId,
      partId: metric.partId,
      topNode: metric.topNode,
      topLabel: metric.topLabel,
      // hasAccess: hasAccess,
      params: metric.params,
      modelId: metric.modelId,
      // accessUsers: metric.access_users,
      // accessRoles: metric.access_roles,
      fieldId: metric.fieldId,
      fieldClass: metric.fieldClass,
      timeFieldId: metric.timefieldId,
      // apiId: metric.apiId,
      formula: metric.formula,
      sql: metric.sql,
      connection: metric.connectionId,
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
      serverTs: Number(metric.serverTs)
    };
  }

  wrapToApiModel(item: {
    model: schemaPostgres.ModelEnt;
    hasAccess: boolean;
  }): common.ModelX {
    let { model, hasAccess } = item;

    return {
      structId: model.structId,
      modelId: model.modelId,
      hasAccess: hasAccess,
      connectionId: model.connectionId,
      filePath: model.filePath,
      content: model.content,
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

  wrapToApiOrg(org: schemaPostgres.OrgEnt): common.Org {
    return {
      orgId: org.orgId,
      name: org.name,
      ownerEmail: org.ownerEmail,
      ownerId: org.ownerId,
      serverTs: Number(org.serverTs)
    };
  }

  wrapToApiOrgsItem(org: schemaPostgres.OrgEnt): common.OrgsItem {
    return {
      orgId: org.orgId,
      name: org.name
    };
  }

  wrapToApiProject(project: schemaPostgres.ProjectEnt): common.Project {
    return {
      orgId: project.orgId,
      projectId: project.projectId,
      name: project.name,
      remoteType: project.remoteType,
      defaultBranch: project.defaultBranch,
      gitUrl: project.gitUrl,
      publicKey: project.publicKey,
      serverTs: Number(project.serverTs)
    };
  }

  wrapToApiProjectsItem(
    project: schemaPostgres.ProjectEnt
  ): common.ProjectsItem {
    return {
      projectId: project.projectId,
      name: project.name,
      defaultBranch: project.defaultBranch
    };
  }

  wrapToApiQuery(x: schemaPostgres.QueryEnt): common.Query {
    return {
      projectId: x.projectId,
      envId: x.envId,
      connectionId: x.connectionId,
      connectionType: x.connectionType,
      queryId: x.queryId,
      sql: x.sql,
      status: x.status,
      lastRunBy: x.lastRunBy,
      lastRunTs: x.lastRunTs,
      lastCancelTs: x.lastCancelTs,
      lastCompleteTs: x.lastCompleteTs,
      lastCompleteDuration: x.lastCompleteDuration,
      lastErrorMessage: x.lastErrorMessage,
      lastErrorTs: x.lastErrorTs,
      data: x.data,
      queryJobId: x.queryJobId,
      bigqueryQueryJobId: x.bigqueryQueryJobId,
      bigqueryConsecutiveErrorsGetJob: x.bigqueryConsecutiveErrorsGetJob,
      bigqueryConsecutiveErrorsGetResults:
        x.bigqueryConsecutiveErrorsGetResults,
      serverTs: x.serverTs
    };
  }

  wrapToApiRep(item: {
    report: schemaPostgres.ReportEnt;
    member: common.Member;
    models: common.ModelX[];
    timezone: string;
    timeSpec: common.TimeSpecEnum;
    timeRangeFraction: common.Fraction;
    timeColumnsLimit: number;
    columns: common.Column[];
    timeColumnsLength: number;
    isTimeColumnsLimitExceeded: boolean;
  }): common.ReportX {
    let {
      report,
      member,
      columns,
      timezone,
      timeSpec,
      models,
      timeRangeFraction,
      timeColumnsLimit,
      timeColumnsLength,
      isTimeColumnsLimitExceeded
    } = item;

    let author;
    if (common.isDefined(report.filePath)) {
      let filePathArray = report.filePath.split('/');

      let usersFolderIndex = filePathArray.findIndex(
        x => x === common.MPROVE_USERS_FOLDER
      );

      author =
        usersFolderIndex > -1 && filePathArray.length > usersFolderIndex + 1
          ? filePathArray[usersFolderIndex + 1]
          : undefined;
    }

    let canEditOrDeleteRep =
      member.isEditor || member.isAdmin || author === member.alias;

    let repX: common.ReportX = {
      projectId: report.projectId,
      structId: report.structId,
      reportId: report.reportId,
      canEditOrDeleteReport: canEditOrDeleteRep,
      author: author,
      draft: report.draft,
      creatorId: report.creatorId,
      filePath: report.filePath,
      accessUsers: report.accessUsers,
      accessRoles: report.accessRoles,
      title: report.title,
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFraction: timeRangeFraction,
      rows: report.rows.map(x => {
        x.hasAccessToModel = common.isDefined(x.mconfig)
          ? models.find(m => m.modelId === x.mconfig.modelId).hasAccess
          : false;
        return x;
      }),
      columns: columns,
      timeColumnsLimit: timeColumnsLimit,
      timeColumnsLength: timeColumnsLength,
      isTimeColumnsLimitExceeded: isTimeColumnsLimitExceeded,
      draftCreatedTs: Number(report.draftCreatedTs),
      serverTs: Number(report.serverTs)
    };

    return repX;
  }

  wrapToApiStruct(struct: schemaPostgres.StructEnt): common.Struct {
    return {
      projectId: struct.projectId,
      structId: struct.structId,
      mproveDirValue: struct.mproveDirValue,
      weekStart: struct.weekStart,
      allowTimezones: struct.allowTimezones,
      simplifySafeAggregates: struct.simplifySafeAggregates,
      defaultTimezone: struct.defaultTimezone,
      formatNumber: struct.formatNumber,
      currencyPrefix: struct.currencyPrefix,
      currencySuffix: struct.currencySuffix,
      errors: struct.errors,
      views: struct.views,
      udfsDict: struct.udfsDict,
      serverTs: Number(struct.serverTs)
    };
  }

  wrapToApiUser(user: schemaPostgres.UserEnt): common.User {
    return {
      userId: user.userId,
      email: user.email,
      alias: user.alias,
      firstName: user.firstName,
      lastName: user.lastName,
      timezone: user.timezone,
      isEmailVerified: user.isEmailVerified,
      ui: {
        timezone: user.ui?.timezone || constants.DEFAULT_UI.timezone,
        timeSpec: user.ui?.timeSpec || constants.DEFAULT_UI.timeSpec,
        timeRangeFraction:
          user.ui?.timeRangeFraction || constants.DEFAULT_UI.timeRangeFraction,

        metricsColumnNameWidth: common.isDefined(
          user.ui?.metricsColumnNameWidth
        )
          ? user.ui?.metricsColumnNameWidth
          : constants.DEFAULT_UI.metricsColumnNameWidth,

        metricsTimeColumnsNarrowWidth: common.isDefined(
          user.ui?.metricsTimeColumnsNarrowWidth
        )
          ? user.ui?.metricsTimeColumnsNarrowWidth
          : constants.DEFAULT_UI.metricsTimeColumnsNarrowWidth,

        metricsTimeColumnsWideWidth: common.isDefined(
          user.ui?.metricsTimeColumnsWideWidth
        )
          ? user.ui?.metricsTimeColumnsWideWidth
          : constants.DEFAULT_UI.metricsTimeColumnsWideWidth,

        showMetricsModelName: common.isDefined(user.ui?.showMetricsModelName)
          ? user.ui?.showMetricsModelName
          : constants.DEFAULT_UI.showMetricsModelName,

        showMetricsTimeFieldName: common.isDefined(
          user.ui?.showMetricsTimeFieldName
        )
          ? user.ui?.showMetricsTimeFieldName
          : constants.DEFAULT_UI.showMetricsTimeFieldName,

        showMetricsChart: common.isDefined(user.ui?.showMetricsChart)
          ? user.ui?.showMetricsChart
          : constants.DEFAULT_UI.showMetricsChart,

        showMetricsChartSettings: common.isDefined(
          user.ui?.showMetricsChartSettings
        )
          ? user.ui?.showMetricsChartSettings
          : constants.DEFAULT_UI.showMetricsChartSettings,

        showChartForSelectedRows: common.isDefined(
          user.ui?.showChartForSelectedRows
        )
          ? user.ui?.showChartForSelectedRows
          : constants.DEFAULT_UI.showChartForSelectedRows,

        showHours: common.isDefined(user.ui?.showHours)
          ? user.ui?.showHours
          : constants.DEFAULT_UI.showHours,

        showParametersJson: common.isDefined(user.ui?.showParametersJson)
          ? user.ui?.showParametersJson
          : constants.DEFAULT_UI.showParametersJson,

        modelTreeLevels: common.isDefined(user.ui?.modelTreeLevels)
          ? user.ui?.modelTreeLevels
          : constants.DEFAULT_UI.modelTreeLevels
      },
      serverTs: Number(user.serverTs)
    };
  }

  wrapToApiChart(item: {
    chart: schemaPostgres.ChartEnt;
    mconfigs: common.MconfigX[];
    queries: common.Query[];
    member: common.Member;
    isAddMconfigAndQuery: boolean;
    models: common.ModelX[];
  }): common.ChartX {
    let { chart, mconfigs, queries, member, isAddMconfigAndQuery, models } =
      item;

    let filePathArray = chart.filePath.split('/');

    let usersFolderIndex = filePathArray.findIndex(
      x => x === common.MPROVE_USERS_FOLDER
    );

    let author =
      usersFolderIndex > -1 && filePathArray.length > usersFolderIndex + 1
        ? filePathArray[usersFolderIndex + 1]
        : undefined;

    let canEditOrDeleteChart =
      member.isEditor || member.isAdmin || author === member.alias;

    return {
      structId: chart.structId,
      chartId: chart.chartId,
      author: author,
      canEditOrDeleteChart: canEditOrDeleteChart,
      title: chart.title,
      modelId: chart.modelId,
      modelLabel: chart.modelLabel,
      filePath: chart.filePath,
      accessUsers: chart.accessUsers,
      accessRoles: chart.accessRoles,
      gr: chart.gr,
      hidden: chart.hidden,
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
  }
}
