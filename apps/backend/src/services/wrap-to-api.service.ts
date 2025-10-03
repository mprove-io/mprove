import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '~backend/config/backend-config';
import { ChartEnt } from '~backend/drizzle/postgres/schema/charts';
import { ConnectionEnt } from '~backend/drizzle/postgres/schema/connections';
import { DashboardEnt } from '~backend/drizzle/postgres/schema/dashboards';
import { EnvEnt } from '~backend/drizzle/postgres/schema/envs';
import { MconfigEnt } from '~backend/drizzle/postgres/schema/mconfigs';
import { MemberEnt } from '~backend/drizzle/postgres/schema/members';
import { ModelEnt } from '~backend/drizzle/postgres/schema/models';
import { OrgEnt } from '~backend/drizzle/postgres/schema/orgs';
import { ProjectEnt } from '~backend/drizzle/postgres/schema/projects';
import { QueryEnt } from '~backend/drizzle/postgres/schema/queries';
import { ReportEnt } from '~backend/drizzle/postgres/schema/reports';
import { StructEnt } from '~backend/drizzle/postgres/schema/structs';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { makeDashboardFiltersX } from '~backend/functions/make-dashboard-filters-x';
import { makeFullName } from '~backend/functions/make-full-name';
import { makeMconfigFields } from '~backend/functions/make-mconfig-fields';
import { makeMconfigFiltersX } from '~backend/functions/make-mconfig-filters-x';
import { makeReportFiltersX } from '~backend/functions/make-report-filters-x';
import { makeTilesX } from '~backend/functions/make-tiles-x';
import { MPROVE_USERS_FOLDER } from '~common/constants/top';
import { DEFAULT_SRV_UI } from '~common/constants/top-backend';
import { StoreMethodEnum } from '~common/enums/store-method.enum';
import { TimeSpecEnum } from '~common/enums/timespec.enum';
import { isDefined } from '~common/functions/is-defined';
import { makeCopy } from '~common/functions/make-copy';
import { ChartX } from '~common/interfaces/backend/chart-x';
import { ConnectionOptions } from '~common/interfaces/backend/connection/connection-options';
import { DashboardX } from '~common/interfaces/backend/dashboard-x';
import { Env } from '~common/interfaces/backend/env';
import { EnvUser } from '~common/interfaces/backend/env-user';
import { EnvsItem } from '~common/interfaces/backend/envs-item';
import { Ev } from '~common/interfaces/backend/ev';
import { MconfigX } from '~common/interfaces/backend/mconfig-x';
import { Member } from '~common/interfaces/backend/member';
import { ModelX } from '~common/interfaces/backend/model-x';
import { Org } from '~common/interfaces/backend/org';
import { OrgsItem } from '~common/interfaces/backend/orgs-item';
import { Project } from '~common/interfaces/backend/project';
import { ProjectConnection } from '~common/interfaces/backend/project-connection';
import { ProjectsItem } from '~common/interfaces/backend/projects-item';
import { ReportX } from '~common/interfaces/backend/report-x';
import { Struct } from '~common/interfaces/backend/struct';
import { User } from '~common/interfaces/backend/user';
import { Column } from '~common/interfaces/blockml/column';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { ModelField } from '~common/interfaces/blockml/model-field';
import { Query } from '~common/interfaces/blockml/query';
import { decryptData } from '~node-common/functions/encryption/decrypt-data';

@Injectable()
export class WrapToApiService {
  constructor(private cs: ConfigService<BackendConfig>) {}

  wrapToApiConnection(item: {
    connection: ConnectionEnt;
    isIncludePasswords: boolean;
  }): ProjectConnection {
    let { connection, isIncludePasswords } = item;

    let options = decryptData<ConnectionOptions>({
      encryptedString: connection.options,
      keyBase64: this.cs.get<BackendConfig['backendAesKey']>('backendAesKey')
    });

    return {
      projectId: connection.projectId,
      connectionId: connection.connectionId,
      envId: connection.envId,
      type: connection.type,
      options: {
        bigquery: isDefined(options.bigquery)
          ? {
              serviceAccountCredentials:
                isIncludePasswords === true
                  ? options.bigquery.serviceAccountCredentials
                  : undefined,
              googleCloudProject: options.bigquery.googleCloudProject,
              googleCloudClientEmail: options.bigquery.googleCloudClientEmail,
              bigqueryQuerySizeLimitGb:
                options.bigquery.bigqueryQuerySizeLimitGb
            }
          : undefined,
        clickhouse: isDefined(options.clickhouse)
          ? {
              host: options.clickhouse.host,
              port: options.clickhouse.port,
              username: options.clickhouse.username,
              password:
                isIncludePasswords === true
                  ? options.clickhouse.password
                  : undefined,
              isSSL: options.clickhouse.isSSL
            }
          : undefined,
        motherduck: isDefined(options.motherduck)
          ? {
              motherduckToken:
                isIncludePasswords === true
                  ? options.motherduck.motherduckToken
                  : undefined,
              database: options.motherduck.database,
              attachModeSingle: options.motherduck.attachModeSingle,
              accessModeReadOnly: options.motherduck.accessModeReadOnly
            }
          : undefined,
        postgres: isDefined(options.postgres)
          ? {
              host: options.postgres.host,
              port: options.postgres.port,
              database: options.postgres.database,
              username: options.postgres.username,
              password:
                isIncludePasswords === true
                  ? options.postgres.password
                  : undefined,
              isSSL: options.postgres.isSSL
            }
          : undefined,
        mysql: isDefined(options.mysql)
          ? {
              host: options.mysql.host,
              port: options.mysql.port,
              database: options.mysql.database,
              user: options.mysql.user,
              password:
                isIncludePasswords === true ? options.mysql.password : undefined
            }
          : undefined,
        trino: isDefined(options.trino)
          ? {
              server: options.trino.server,
              catalog: options.trino.catalog,
              schema: options.trino.schema,
              user: options.trino.user,
              password:
                isIncludePasswords === true ? options.trino.password : undefined
            }
          : undefined,
        presto: isDefined(options.presto)
          ? {
              server: options.presto.server,
              port: options.presto.port,
              catalog: options.presto.catalog,
              schema: options.presto.schema,
              user: options.presto.user,
              password:
                isIncludePasswords === true
                  ? options.presto.password
                  : undefined
            }
          : undefined,
        snowflake: isDefined(options.snowflake)
          ? {
              account: options.snowflake.account,
              warehouse: options.snowflake.warehouse,
              database: options.snowflake.database,
              username: options.snowflake.username,
              password:
                isIncludePasswords === true
                  ? options.snowflake.password
                  : undefined
            }
          : undefined,
        storeApi: isDefined(options.storeApi)
          ? {
              baseUrl: options.storeApi.baseUrl,
              headers: options.storeApi.headers?.map(header => ({
                key: header.key,
                value: isIncludePasswords === true ? (header.value ?? '') : ''
              }))
            }
          : undefined,
        storeGoogleApi: isDefined(options.storeGoogleApi)
          ? {
              baseUrl: options.storeGoogleApi.baseUrl,
              headers: options.storeGoogleApi.headers?.map(header => ({
                key: header.key,
                value: isIncludePasswords === true ? (header.value ?? '') : ''
              })),
              googleAuthScopes: options.storeGoogleApi.googleAuthScopes,
              serviceAccountCredentials:
                isIncludePasswords === true
                  ? options.storeGoogleApi.serviceAccountCredentials
                  : undefined,
              googleCloudProject: options.storeGoogleApi.googleCloudProject,
              googleCloudClientEmail:
                options.storeGoogleApi.googleCloudClientEmail,
              googleAccessToken: options.storeGoogleApi.googleAccessToken
            }
          : undefined
      },
      serverTs: connection.serverTs
    };
  }

  wrapToApiDashboard(item: {
    dashboard: DashboardEnt;
    mconfigs: MconfigX[];
    queries: Query[];
    member: Member;
    isAddMconfigAndQuery: boolean;
    models: ModelX[];
  }): DashboardX {
    let { dashboard, mconfigs, queries, isAddMconfigAndQuery, member, models } =
      item;

    let filePathArray = dashboard.filePath.split('/');

    let usersFolderIndex = filePathArray.findIndex(
      x => x === MPROVE_USERS_FOLDER
    );

    let author =
      usersFolderIndex > -1 && filePathArray.length > usersFolderIndex + 1
        ? filePathArray[usersFolderIndex + 1]
        : undefined;

    let canEditOrDeleteDashboard =
      member.isEditor || member.isAdmin || author === member.alias;

    let dashboardExtendedFilters = makeDashboardFiltersX(dashboard);

    let storeModelIds = dashboard.fields
      .filter(x => isDefined(x.storeModel))
      .map(x => x.storeModel);

    let dashboardX: DashboardX = {
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
    env: EnvEnt;
    envConnectionIds: string[];
    fallbackConnectionIds: string[];
    fallbackEvs: Ev[];
    envMembers: MemberEnt[];
  }): Env {
    let {
      env,
      envConnectionIds,
      fallbackConnectionIds,
      fallbackEvs,
      envMembers
    } = item;

    let envUsers: EnvUser[] = [];

    envMembers.forEach(x => {
      let envUser: EnvUser = {
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

  wrapToApiEnvsItem(env: EnvEnt): EnvsItem {
    return {
      projectId: env.projectId,
      envId: env.envId
    };
  }

  wrapToApiMconfig(item: {
    mconfig: MconfigEnt;
    modelFields: ModelField[];
  }): MconfigX {
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
      malloyQueryStable: mconfig.malloyQueryStable,
      malloyQueryExtra: mconfig.malloyQueryExtra,
      compiledQuery: mconfig.compiledQuery,
      select: mconfig.select,
      // unsafeSelect: mconfig.unsafeSelect,
      // warnSelect: mconfig.warnSelect,
      // joinAggregations: mconfig.joinAggregations,
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

  wrapToApiMember(x: MemberEnt): Member {
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

  wrapToApiEnvUser(x: MemberEnt): EnvUser {
    return {
      userId: x.memberId,
      alias: x.alias,
      firstName: x.firstName,
      lastName: x.lastName,
      fullName: makeFullName({ firstName: x.firstName, lastName: x.lastName })
    };
  }

  wrapToApiModel(item: {
    model: ModelEnt;
    hasAccess: boolean;
  }): ModelX {
    let { model, hasAccess } = item;

    let modelX: ModelX = {
      structId: model.structId,
      modelId: model.modelId,
      type: model.type,
      source: model.source,
      malloyModelDef: model.malloyModelDef,
      hasAccess: hasAccess,
      connectionId: model.connectionId,
      connectionType: model.connectionType,
      filePath: model.filePath,
      fileText: model.fileText,
      storeContent: model.storeContent,
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

    return modelX;
  }

  wrapToApiOrg(org: OrgEnt): Org {
    return {
      orgId: org.orgId,
      name: org.name,
      ownerEmail: org.ownerEmail,
      ownerId: org.ownerId,
      serverTs: Number(org.serverTs)
    };
  }

  wrapToApiOrgsItem(org: OrgEnt): OrgsItem {
    return {
      orgId: org.orgId,
      name: org.name
    };
  }

  wrapToApiProject(item: {
    project: ProjectEnt;
    isAdmin: boolean;
  }): Project {
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

  wrapToApiProjectsItem(project: ProjectEnt): ProjectsItem {
    return {
      projectId: project.projectId,
      name: project.name,
      defaultBranch: project.defaultBranch
    };
  }

  wrapToApiQuery(x: QueryEnt): Query {
    return {
      projectId: x.projectId,
      envId: x.envId,
      connectionId: x.connectionId,
      connectionType: x.connectionType,
      queryId: x.queryId,
      sql: x.sql,
      apiMethod: x.apiMethod as StoreMethodEnum,
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
    report: ReportEnt;
    member: Member;
    models: ModelX[];
    timezone: string;
    timeSpec: TimeSpecEnum;
    timeRangeFraction: Fraction;
    // rangeOpen: number;
    // rangeClose: number;
    rangeStart: number;
    rangeEnd: number;
    timeColumnsLimit: number;
    columns: Column[];
    timeColumnsLength: number;
    isTimeColumnsLimitExceeded: boolean;
    metricsStartDateYYYYMMDD: string;
    metricsEndDateExcludedYYYYMMDD: string;
    metricsEndDateIncludedYYYYMMDD: string;
  }): ReportX {
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
    if (isDefined(report.filePath)) {
      let filePathArray = report.filePath.split('/');

      let usersFolderIndex = filePathArray.findIndex(
        x => x === MPROVE_USERS_FOLDER
      );

      author =
        usersFolderIndex > -1 && filePathArray.length > usersFolderIndex + 1
          ? filePathArray[usersFolderIndex + 1]
          : undefined;
    }

    let canEditOrDeleteRep =
      member.isEditor || member.isAdmin || author === member.alias;

    let reportExtendedFilters = makeReportFiltersX(report);

    let reportX: ReportX = {
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
        x.hasAccessToModel = isDefined(x.mconfig)
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

  wrapToApiStruct(struct: StructEnt): Struct {
    return {
      projectId: struct.projectId,
      structId: struct.structId,
      errors: struct.errors,
      metrics: struct.metrics,
      presets: struct.presets,
      mproveConfig: struct.mproveConfig,
      mproveVersion: struct.mproveVersion,
      serverTs: Number(struct.serverTs)
    };
  }

  wrapToApiUser(user: UserEnt): User {
    let defaultSrvUi = makeCopy(DEFAULT_SRV_UI);

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

        projectFileLinks: isDefined(user.ui?.projectFileLinks)
          ? user.ui?.projectFileLinks
          : defaultSrvUi.projectFileLinks,

        projectModelLinks: isDefined(user.ui?.projectModelLinks)
          ? user.ui?.projectModelLinks
          : defaultSrvUi.projectModelLinks,

        projectChartLinks: isDefined(user.ui?.projectChartLinks)
          ? user.ui?.projectChartLinks
          : defaultSrvUi.projectChartLinks,

        projectDashboardLinks: isDefined(user.ui?.projectDashboardLinks)
          ? user.ui?.projectDashboardLinks
          : defaultSrvUi.projectDashboardLinks,

        projectReportLinks: isDefined(user.ui?.projectReportLinks)
          ? user.ui?.projectReportLinks
          : defaultSrvUi.projectReportLinks,

        modelTreeLevels: isDefined(user.ui?.modelTreeLevels)
          ? user.ui?.modelTreeLevels
          : defaultSrvUi.modelTreeLevels
      },
      serverTs: Number(user.serverTs)
    };
  }

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
