import { Injectable } from '@nestjs/common';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { makeDashboardFiltersX } from '~backend/functions/make-dashboard-filters-x';
import { makeFullName } from '~backend/functions/make-full-name';
import { makeMconfigFields } from '~backend/functions/make-mconfig-fields';
import { makeMconfigFiltersX } from '~backend/functions/make-mconfig-filters-x';
import { makeReportFiltersX } from '~backend/functions/make-report-filters-x';
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
      baseUrl: x.baseUrl,
      headers: x.headers?.map(header => {
        let newHeader: common.ConnectionHeader = {
          key: header.key,
          value: common.isDefinedAndNotEmpty(header.value)
            ? common.HEADER_VALUE_IS_HIDDEN
            : ''
        };
        return newHeader;
      }),
      googleAuthScopes: x.googleAuthScopes,
      googleCloudProject: x.googleCloudProject,
      googleCloudClientEmail: x.googleCloudClientEmail,
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

    let storeModelIds = dashboard.fields
      .filter(x => common.isDefined(x.storeModel))
      .map(x => x.storeModel);

    let dashboardX: common.DashboardX = {
      structId: dashboard.structId,
      dashboardId: dashboard.dashboardId,
      draft: dashboard.draft,
      creatorId: dashboard.creatorId,
      author: author,
      canEditOrDeleteDashboard: canEditOrDeleteDashboard,
      filePath: dashboard.filePath,
      content: dashboard.content,
      accessRoles: dashboard.accessRoles,
      title: dashboard.title,
      gr: dashboard.gr,
      hidden: dashboard.hidden,
      fields: dashboard.fields.sort((a, b) => {
        let labelA = a.label.toUpperCase();
        let labelB = b.label.toUpperCase();
        return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
      }),
      extendedFilters: dashboardExtendedFilters.sort((a, b) => {
        let labelA = a.fieldId.toUpperCase();
        let labelB = b.fieldId.toUpperCase();
        return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
      }),
      description: dashboard.description,
      tiles: makeTilesX({
        tiles: dashboard.tiles,
        mconfigs: mconfigs,
        queries: queries,
        isAddMconfigAndQuery: isAddMconfigAndQuery,
        models: models,
        dashboardExtendedFilters: dashboardExtendedFilters
      }),
      storeModels:
        storeModelIds.length > 0
          ? models.filter(model => storeModelIds.indexOf(model.modelId) > -1)
          : [],
      serverTs: dashboard.serverTs
    };

    return dashboardX;
  }

  wrapToApiEnv(item: {
    env: schemaPostgres.EnvEnt;
    envConnectionIds: string[];
    fallbackConnectionIds: string[];
    fallbackEvs: common.Ev[];
    envMembers: schemaPostgres.MemberEnt[];
  }): common.Env {
    let {
      env,
      envConnectionIds,
      fallbackConnectionIds,
      fallbackEvs,
      envMembers
    } = item;

    let envUsers: common.EnvUser[] = [];

    envMembers.forEach(x => {
      let envUser: common.EnvUser = {
        userId: x.memberId,
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
      fallbackConnectionIds: fallbackConnectionIds,
      envConnectionIdsWithFallback: [
        ...envConnectionIds,
        ...fallbackConnectionIds
      ].sort((a, b) => (a > b ? 1 : b > a ? -1 : 0)),
      evs: env.evs,
      fallbackEvIds: fallbackEvs.map(x => x.evId),
      evsWithFallback: [...env.evs, ...fallbackEvs].sort((a, b) =>
        a.evId > b.evId ? 1 : b.evId > a.evId ? -1 : 0
      ),
      envUsers: envUsers,
      isFallbackToProdConnections: env.isFallbackToProdConnections,
      isFallbackToProdVariables: env.isFallbackToProdVariables
    };
  }

  wrapToApiEnvsItem(env: schemaPostgres.EnvEnt): common.EnvsItem {
    return {
      projectId: env.projectId,
      envId: env.envId
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
      modelType: mconfig.modelType,
      // isStoreModel: mconfig.isStoreModel,
      dateRangeIncludesRightSide: mconfig.dateRangeIncludesRightSide,
      storePart: mconfig.storePart,
      modelLabel: mconfig.modelLabel,
      modelFilePath: mconfig.modelFilePath,
      malloyQuery: mconfig.malloyQuery,
      compiledQuery: mconfig.compiledQuery,
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
      isAdmin: x.isAdmin,
      isEditor: x.isEditor,
      isExplorer: x.isExplorer,
      roles: x.roles,
      serverTs: x.serverTs
    };
  }

  wrapToApiEnvUser(x: schemaPostgres.MemberEnt): common.EnvUser {
    return {
      userId: x.memberId,
      alias: x.alias,
      firstName: x.firstName,
      lastName: x.lastName,
      fullName: makeFullName({ firstName: x.firstName, lastName: x.lastName })
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
      type: model.type,
      source: model.source,
      malloyModelDef: model.malloyModelDef,
      hasAccess: hasAccess,
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

  wrapToApiProject(item: {
    project: schemaPostgres.ProjectEnt;
    isAdmin: boolean;
  }): common.Project {
    let { project, isAdmin } = item;

    return {
      orgId: project.orgId,
      projectId: project.projectId,
      name: project.name,
      remoteType: project.remoteType,
      defaultBranch: project.defaultBranch,
      gitUrl: isAdmin === true ? project.gitUrl : undefined,
      publicKey: isAdmin === true ? project.publicKey : undefined,
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
      apiMethod: x.apiMethod as common.StoreMethodEnum,
      apiUrl: x.apiUrl,
      apiBody: x.apiBody,
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

  wrapToApiReport(item: {
    report: schemaPostgres.ReportEnt;
    member: common.Member;
    models: common.ModelX[];
    timezone: string;
    timeSpec: common.TimeSpecEnum;
    timeRangeFraction: common.Fraction;
    // rangeOpen: number;
    // rangeClose: number;
    rangeStart: number;
    rangeEnd: number;
    timeColumnsLimit: number;
    columns: common.Column[];
    timeColumnsLength: number;
    isTimeColumnsLimitExceeded: boolean;
    metricsStartDateYYYYMMDD: string;
    metricsEndDateExcludedYYYYMMDD: string;
    metricsEndDateIncludedYYYYMMDD: string;
  }): common.ReportX {
    let {
      report,
      member,
      columns,
      timezone,
      timeSpec,
      models,
      timeRangeFraction,
      // rangeOpen,
      // rangeClose,
      rangeStart,
      rangeEnd,
      timeColumnsLimit,
      timeColumnsLength,
      isTimeColumnsLimitExceeded,
      metricsStartDateYYYYMMDD,
      metricsEndDateExcludedYYYYMMDD,
      metricsEndDateIncludedYYYYMMDD
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

    let reportExtendedFilters = makeReportFiltersX(report);

    let reportX: common.ReportX = {
      projectId: report.projectId,
      structId: report.structId,
      reportId: report.reportId,
      canEditOrDeleteReport: canEditOrDeleteRep,
      author: author,
      draft: report.draft,
      creatorId: report.creatorId,
      filePath: report.filePath,
      accessRoles: report.accessRoles,
      title: report.title,
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFraction: timeRangeFraction,
      // rangeOpen: rangeOpen,
      // rangeClose: rangeClose,
      rangeStart: rangeStart,
      rangeEnd: rangeEnd,
      metricsStartDateYYYYMMDD: metricsStartDateYYYYMMDD,
      metricsEndDateExcludedYYYYMMDD: metricsEndDateExcludedYYYYMMDD,
      metricsEndDateIncludedYYYYMMDD: metricsEndDateIncludedYYYYMMDD,
      fields: report.fields.sort((a, b) => {
        let labelA = a.label.toUpperCase();
        let labelB = b.label.toUpperCase();
        return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
      }),
      extendedFilters: reportExtendedFilters.sort((a, b) => {
        let labelA = a.fieldId.toUpperCase();
        let labelB = b.fieldId.toUpperCase();
        return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
      }),
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
      chart: report.chart,
      draftCreatedTs: Number(report.draftCreatedTs),
      serverTs: Number(report.serverTs)
    };

    return reportX;
  }

  wrapToApiStruct(struct: schemaPostgres.StructEnt): common.Struct {
    return {
      projectId: struct.projectId,
      structId: struct.structId,
      mproveDirValue: struct.mproveDirValue,
      weekStart: struct.weekStart,
      allowTimezones: struct.allowTimezones,
      caseSensitiveStringFilters: struct.caseSensitiveStringFilters,
      simplifySafeAggregates: struct.simplifySafeAggregates,
      defaultTimezone: struct.defaultTimezone,
      formatNumber: struct.formatNumber,
      currencyPrefix: struct.currencyPrefix,
      currencySuffix: struct.currencySuffix,
      thousandsSeparator: struct.thousandsSeparator,
      errors: struct.errors,
      views: struct.views,
      metrics: struct.metrics,
      presets: struct.presets,
      udfsDict: struct.udfsDict,
      serverTs: Number(struct.serverTs)
    };
  }

  wrapToApiUser(user: schemaPostgres.UserEnt): common.User {
    let defaultSrvUi = common.makeCopy(constants.DEFAULT_SRV_UI);

    return {
      userId: user.userId,
      email: user.email,
      alias: user.alias,
      firstName: user.firstName,
      lastName: user.lastName,
      isEmailVerified: user.isEmailVerified,
      ui: {
        timezone: user.ui?.timezone || defaultSrvUi.timezone,
        timeSpec: user.ui?.timeSpec || defaultSrvUi.timeSpec,
        timeRangeFraction:
          user.ui?.timeRangeFraction || defaultSrvUi.timeRangeFraction,

        projectFileLinks: common.isDefined(user.ui?.projectFileLinks)
          ? user.ui?.projectFileLinks
          : defaultSrvUi.projectFileLinks,

        projectModelLinks: common.isDefined(user.ui?.projectModelLinks)
          ? user.ui?.projectModelLinks
          : defaultSrvUi.projectModelLinks,

        projectChartLinks: common.isDefined(user.ui?.projectChartLinks)
          ? user.ui?.projectChartLinks
          : defaultSrvUi.projectChartLinks,

        projectDashboardLinks: common.isDefined(user.ui?.projectDashboardLinks)
          ? user.ui?.projectDashboardLinks
          : defaultSrvUi.projectDashboardLinks,

        projectReportLinks: common.isDefined(user.ui?.projectReportLinks)
          ? user.ui?.projectReportLinks
          : defaultSrvUi.projectReportLinks,

        modelTreeLevels: common.isDefined(user.ui?.modelTreeLevels)
          ? user.ui?.modelTreeLevels
          : defaultSrvUi.modelTreeLevels
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

    let filePathArray = common.isDefined(chart.filePath)
      ? chart.filePath.split('/')
      : [];

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
