import { Injectable } from '@nestjs/common';
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
import { ChartTab } from '~common/interfaces/backend/chart-tab';
import { ChartX } from '~common/interfaces/backend/chart-x';
import { ConnectionTab } from '~common/interfaces/backend/connection-parts/connection-tab';
import { DashboardTab } from '~common/interfaces/backend/dashboard-tab';
import { DashboardX } from '~common/interfaces/backend/dashboard-x';
import { Env } from '~common/interfaces/backend/env';
import { EnvTab } from '~common/interfaces/backend/env-tab';
import { EnvUser } from '~common/interfaces/backend/env-user';
import { EnvsItem } from '~common/interfaces/backend/envs-item';
import { Ev } from '~common/interfaces/backend/ev';
import { MconfigTab } from '~common/interfaces/backend/mconfig-tab';
import { MconfigX } from '~common/interfaces/backend/mconfig-x';
import { Member } from '~common/interfaces/backend/member';
import { MemberTab } from '~common/interfaces/backend/member-tab';
import { ModelTab } from '~common/interfaces/backend/model-tab';
import { ModelX } from '~common/interfaces/backend/model-x';
import { Org } from '~common/interfaces/backend/org';
import { OrgTab } from '~common/interfaces/backend/org-tab';
import { OrgsItem } from '~common/interfaces/backend/orgs-item';
import { Project } from '~common/interfaces/backend/project';
import { ProjectConnection } from '~common/interfaces/backend/project-connection';
import { ProjectTab } from '~common/interfaces/backend/project-tab';
import { ProjectsItem } from '~common/interfaces/backend/projects-item';
import { QueryTab } from '~common/interfaces/backend/query-tab';
import { ReportTab } from '~common/interfaces/backend/report-tab';
import { ReportX } from '~common/interfaces/backend/report-x';
import { Struct } from '~common/interfaces/backend/struct';
import { StructTab } from '~common/interfaces/backend/struct-tab';
import { User } from '~common/interfaces/backend/user';
import { UserTab } from '~common/interfaces/backend/user-tab';
import { Column } from '~common/interfaces/blockml/column';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { ModelField } from '~common/interfaces/blockml/model-field';
import { Query } from '~common/interfaces/blockml/query';
import { TabService } from './tab.service';

@Injectable()
export class WrapToApiService {
  constructor(private tabService: TabService) {}

  wrapToApiConnection(item: {
    connection: ConnectionEnt;
    isIncludePasswords: boolean;
  }): ProjectConnection {
    let { connection, isIncludePasswords } = item;

    let connectionTab = this.tabService.decrypt<ConnectionTab>({
      encryptedString: connection.tab
    });

    let options = connectionTab.options;

    let projectConnection: ProjectConnection = {
      projectId: connection.projectId,
      connectionId: connection.connectionId,
      envId: connection.envId,
      type: connection.type,
      tab: {
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
                  isIncludePasswords === true
                    ? options.mysql.password
                    : undefined
              }
            : undefined,
          trino: isDefined(options.trino)
            ? {
                server: options.trino.server,
                catalog: options.trino.catalog,
                schema: options.trino.schema,
                user: options.trino.user,
                password:
                  isIncludePasswords === true
                    ? options.trino.password
                    : undefined
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
        }
      },
      serverTs: connection.serverTs
    };

    return projectConnection;
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

    let dashboardTab = this.tabService.decrypt<DashboardTab>({
      encryptedString: dashboard.tab
    });

    let filePathArray = dashboardTab.filePath.split('/');

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

    let storeModelIds = dashboardTab.fields
      .filter(x => isDefined(x.storeModel))
      .map(x => x.storeModel);

    let apiDashboard: DashboardX = {
      structId: dashboard.structId,
      dashboardId: dashboard.dashboardId,
      draft: dashboard.draft,
      creatorId: dashboard.creatorId,
      author: author,
      canEditOrDeleteDashboard: canEditOrDeleteDashboard,
      filePath: dashboardTab.filePath,
      content: dashboardTab.content,
      accessRoles: dashboardTab.accessRoles,
      title: dashboardTab.title,
      fields: dashboardTab.fields.sort((a, b) => {
        let labelA = a.label.toUpperCase();
        let labelB = b.label.toUpperCase();
        return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
      }),
      extendedFilters: dashboardExtendedFilters.sort((a, b) => {
        let labelA = a.fieldId.toUpperCase();
        let labelB = b.fieldId.toUpperCase();
        return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
      }),
      tiles: makeTilesX({
        tiles: dashboardTab.tiles,
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

    return apiDashboard;
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

    let envTab = this.tabService.decrypt<EnvTab>({
      encryptedString: env.tab
    });

    let envUsers: EnvUser[] = [];

    envMembers.forEach(member => {
      let memberTab = this.tabService.decrypt<MemberTab>({
        encryptedString: member.tab
      });

      let envUser: EnvUser = {
        userId: member.memberId,
        alias: memberTab.alias,
        firstName: memberTab.firstName,
        lastName: memberTab.lastName,
        fullName: makeFullName({
          firstName: memberTab.firstName,
          lastName: memberTab.lastName
        })
      };

      envUsers.push(envUser);
    });

    let apiEnv: Env = {
      projectId: env.projectId,
      envId: env.envId,
      envConnectionIds: envConnectionIds,
      fallbackConnectionIds: fallbackConnectionIds,
      envConnectionIdsWithFallback: [
        ...envConnectionIds,
        ...fallbackConnectionIds
      ].sort((a, b) => (a > b ? 1 : b > a ? -1 : 0)),
      evs: envTab.evs,
      fallbackEvIds: fallbackEvs.map(x => x.evId),
      evsWithFallback: [...envTab.evs, ...fallbackEvs].sort((a, b) =>
        a.evId > b.evId ? 1 : b.evId > a.evId ? -1 : 0
      ),
      envUsers: envUsers,
      isFallbackToProdConnections: env.isFallbackToProdConnections,
      isFallbackToProdVariables: env.isFallbackToProdVariables
    };

    return apiEnv;
  }

  wrapToApiEnvsItem(item: { env: EnvEnt }): EnvsItem {
    let { env } = item;

    let apiEnvsItem: EnvsItem = {
      projectId: env.projectId,
      envId: env.envId
    };

    return apiEnvsItem;
  }

  wrapToApiMconfig(item: {
    mconfig: MconfigEnt;
    modelFields: ModelField[];
  }): MconfigX {
    let { mconfig, modelFields } = item;

    let mconfigTab = this.tabService.decrypt<MconfigTab>({
      encryptedString: mconfig.tab
    });

    let apiMconfig: MconfigX = {
      structId: mconfig.structId,
      mconfigId: mconfig.mconfigId,
      queryId: mconfig.queryId,
      modelId: mconfig.modelId,
      modelType: mconfig.modelType,
      dateRangeIncludesRightSide: mconfigTab.dateRangeIncludesRightSide,
      storePart: mconfigTab.storePart,
      modelLabel: mconfigTab.modelLabel,
      modelFilePath: mconfigTab.modelFilePath,
      malloyQueryStable: mconfigTab.malloyQueryStable,
      malloyQueryExtra: mconfigTab.malloyQueryExtra,
      compiledQuery: mconfigTab.compiledQuery,
      select: mconfigTab.select,
      fields: makeMconfigFields({
        modelFields: modelFields,
        select: mconfigTab.select,
        sortings: mconfigTab.sortings,
        chart: mconfigTab.chart
      }),
      extendedFilters: makeMconfigFiltersX({
        modelFields: modelFields,
        mconfigFilters: mconfigTab.filters
      }),
      sortings: mconfigTab.sortings,
      sorts: mconfigTab.sorts,
      timezone: mconfigTab.timezone,
      limit: mconfigTab.limit,
      filters: mconfigTab.filters,
      chart: mconfigTab.chart,
      temp: mconfig.temp,
      serverTs: mconfig.serverTs
    };

    return apiMconfig;
  }

  wrapToApiMember(item: { member: MemberEnt }): Member {
    let { member } = item;

    let memberTab = this.tabService.decrypt<MemberTab>({
      encryptedString: member.tab
    });

    let apiMember: Member = {
      projectId: member.projectId,
      memberId: member.memberId,
      email: memberTab.email,
      alias: memberTab.alias,
      firstName: memberTab.firstName,
      lastName: memberTab.lastName,
      fullName: makeFullName({
        firstName: memberTab.firstName,
        lastName: memberTab.lastName
      }),
      avatarSmall: undefined,
      isAdmin: member.isAdmin,
      isEditor: member.isEditor,
      isExplorer: member.isExplorer,
      roles: memberTab.roles,
      serverTs: member.serverTs
    };

    return apiMember;
  }

  wrapToApiEnvUser(item: { member: MemberEnt }): EnvUser {
    let { member } = item;

    let memberTab = this.tabService.decrypt<MemberTab>({
      encryptedString: member.tab
    });

    let apiEnvUser: EnvUser = {
      userId: member.memberId,
      alias: memberTab.alias,
      firstName: memberTab.firstName,
      lastName: memberTab.lastName,
      fullName: makeFullName({
        firstName: memberTab.firstName,
        lastName: memberTab.lastName
      })
    };

    return apiEnvUser;
  }

  wrapToApiModel(item: {
    model: ModelEnt;
    hasAccess: boolean;
  }): ModelX {
    let { model, hasAccess } = item;

    let modelTab = this.tabService.decrypt<ModelTab>({
      encryptedString: model.tab
    });

    let apiModel: ModelX = {
      structId: model.structId,
      modelId: model.modelId,
      type: model.type,
      source: modelTab.source,
      malloyModelDef: modelTab.malloyModelDef,
      hasAccess: hasAccess,
      connectionId: model.connectionId,
      connectionType: model.connectionType,
      filePath: modelTab.filePath,
      fileText: modelTab.fileText,
      storeContent: modelTab.storeContent,
      dateRangeIncludesRightSide: modelTab.dateRangeIncludesRightSide,
      accessRoles: modelTab.accessRoles,
      label: modelTab.label,
      fields: modelTab.fields,
      nodes: modelTab.nodes,
      serverTs: model.serverTs
    };

    return apiModel;
  }

  wrapToApiOrg(item: { org: OrgEnt }): Org {
    let { org } = item;

    let orgTab = this.tabService.decrypt<OrgTab>({
      encryptedString: org.tab
    });

    let apiOrg: Org = {
      orgId: org.orgId,
      name: orgTab.name,
      ownerId: org.ownerId,
      ownerEmail: orgTab.ownerEmail,
      serverTs: Number(org.serverTs)
    };

    return apiOrg;
  }

  wrapToApiOrgsItem(item: { org: OrgEnt }): OrgsItem {
    let { org } = item;

    let orgTab = this.tabService.decrypt<OrgTab>({
      encryptedString: org.tab
    });

    let apiOrgsItem: OrgsItem = {
      orgId: org.orgId,
      name: orgTab.name
    };

    return apiOrgsItem;
  }

  wrapToApiProject(item: {
    project: ProjectEnt;
    isAddPrivateKey: boolean;
    isAddPublicKey: boolean;
    isAddGitUrl: boolean;
  }): Project {
    let { project, isAddGitUrl, isAddPrivateKey, isAddPublicKey } = item;

    let projectTab = this.tabService.decrypt<ProjectTab>({
      encryptedString: project.tab
    });

    let apiProject: Project = {
      orgId: project.orgId,
      projectId: project.projectId,
      remoteType: project.remoteType,
      tab: {
        name: projectTab.name,
        defaultBranch: projectTab.defaultBranch,
        gitUrl: isAddGitUrl === true ? projectTab.gitUrl : undefined,
        privateKey:
          isAddPrivateKey === true ? projectTab.privateKey : undefined,
        publicKey: isAddPublicKey === true ? projectTab.publicKey : undefined
      },
      serverTs: Number(project.serverTs)
    };

    return apiProject;
  }

  wrapToApiProjectsItem(item: {
    project: ProjectEnt;
  }): ProjectsItem {
    let { project } = item;

    let projectTab = this.tabService.decrypt<ProjectTab>({
      encryptedString: project.tab
    });

    let apiProjectItem: ProjectsItem = {
      projectId: project.projectId,
      name: projectTab.name,
      defaultBranch: projectTab.defaultBranch
    };

    return apiProjectItem;
  }

  wrapToApiQuery(item: { query: QueryEnt }): Query {
    let { query } = item;

    let queryTab = this.tabService.decrypt<QueryTab>({
      encryptedString: query.tab
    });

    let apiQuery: Query = {
      projectId: query.projectId,
      envId: query.envId,
      connectionId: query.connectionId,
      connectionType: query.connectionType,
      queryId: query.queryId,
      sql: queryTab.sql,
      apiMethod: queryTab.apiMethod as StoreMethodEnum,
      apiUrl: queryTab.apiUrl,
      apiBody: queryTab.apiBody,
      status: query.status,
      lastRunBy: query.lastRunBy,
      lastRunTs: query.lastRunTs,
      lastCancelTs: query.lastCancelTs,
      lastCompleteTs: query.lastCompleteTs,
      lastCompleteDuration: query.lastCompleteDuration,
      lastErrorMessage: queryTab.lastErrorMessage,
      lastErrorTs: query.lastErrorTs,
      data: queryTab.data,
      queryJobId: query.queryJobId,
      bigqueryQueryJobId: query.bigqueryQueryJobId,
      bigqueryConsecutiveErrorsGetJob: query.bigqueryConsecutiveErrorsGetJob,
      bigqueryConsecutiveErrorsGetResults:
        query.bigqueryConsecutiveErrorsGetResults,
      serverTs: query.serverTs
    };

    return apiQuery;
  }

  wrapToApiReport(item: {
    report: ReportEnt;
    member: Member;
    models: ModelX[];
    timezone: string;
    timeSpec: TimeSpecEnum;
    timeRangeFraction: Fraction;
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
      rangeStart,
      rangeEnd,
      timeColumnsLimit,
      timeColumnsLength,
      isTimeColumnsLimitExceeded,
      metricsStartDateYYYYMMDD,
      metricsEndDateExcludedYYYYMMDD,
      metricsEndDateIncludedYYYYMMDD
    } = item;

    let reportTab = this.tabService.decrypt<ReportTab>({
      encryptedString: report.tab
    });

    let author;
    if (isDefined(reportTab.filePath)) {
      let filePathArray = reportTab.filePath.split('/');

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

    let apiReport: ReportX = {
      projectId: report.projectId,
      structId: report.structId,
      reportId: report.reportId,
      canEditOrDeleteReport: canEditOrDeleteRep,
      author: author,
      draft: report.draft,
      creatorId: report.creatorId,
      filePath: reportTab.filePath,
      accessRoles: reportTab.accessRoles,
      title: reportTab.title,
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFraction: timeRangeFraction,
      rangeStart: rangeStart,
      rangeEnd: rangeEnd,
      metricsStartDateYYYYMMDD: metricsStartDateYYYYMMDD,
      metricsEndDateExcludedYYYYMMDD: metricsEndDateExcludedYYYYMMDD,
      metricsEndDateIncludedYYYYMMDD: metricsEndDateIncludedYYYYMMDD,
      fields: reportTab.fields.sort((a, b) => {
        let labelA = a.label.toUpperCase();
        let labelB = b.label.toUpperCase();
        return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
      }),
      extendedFilters: reportExtendedFilters.sort((a, b) => {
        let labelA = a.fieldId.toUpperCase();
        let labelB = b.fieldId.toUpperCase();
        return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
      }),
      rows: reportTab.rows.map(x => {
        x.hasAccessToModel = isDefined(x.mconfig)
          ? models.find(m => m.modelId === x.mconfig.modelId).hasAccess
          : false;
        return x;
      }),
      columns: columns,
      timeColumnsLimit: timeColumnsLimit,
      timeColumnsLength: timeColumnsLength,
      isTimeColumnsLimitExceeded: isTimeColumnsLimitExceeded,
      chart: reportTab.chart,
      draftCreatedTs: Number(report.draftCreatedTs),
      serverTs: Number(report.serverTs)
    };

    return apiReport;
  }

  wrapToApiStruct(item: { struct: StructEnt }): Struct {
    let { struct } = item;

    let structTab = this.tabService.decrypt<StructTab>({
      encryptedString: struct.tab
    });

    let apiStruct: Struct = {
      projectId: struct.projectId,
      structId: struct.structId,
      errors: structTab.errors,
      metrics: structTab.metrics,
      presets: structTab.presets,
      mproveConfig: structTab.mproveConfig,
      mproveVersion: struct.mproveVersion,
      serverTs: Number(struct.serverTs)
    };

    return apiStruct;
  }

  wrapToApiUser(item: { user: UserEnt }): User {
    let { user } = item;

    let userTab = this.tabService.decrypt<UserTab>({
      encryptedString: user.tab
    });

    let defaultSrvUi = makeCopy(DEFAULT_SRV_UI);

    let apiUser: User = {
      userId: user.userId,
      email: userTab.email,
      alias: userTab.alias,
      firstName: userTab.firstName,
      lastName: userTab.lastName,
      isEmailVerified: user.isEmailVerified,
      ui: {
        timezone: userTab.ui?.timezone || defaultSrvUi.timezone,
        timeSpec: userTab.ui?.timeSpec || defaultSrvUi.timeSpec,
        timeRangeFraction:
          userTab.ui?.timeRangeFraction || defaultSrvUi.timeRangeFraction,

        projectFileLinks: isDefined(userTab.ui?.projectFileLinks)
          ? userTab.ui?.projectFileLinks
          : defaultSrvUi.projectFileLinks,

        projectModelLinks: isDefined(userTab.ui?.projectModelLinks)
          ? userTab.ui?.projectModelLinks
          : defaultSrvUi.projectModelLinks,

        projectChartLinks: isDefined(userTab.ui?.projectChartLinks)
          ? userTab.ui?.projectChartLinks
          : defaultSrvUi.projectChartLinks,

        projectDashboardLinks: isDefined(userTab.ui?.projectDashboardLinks)
          ? userTab.ui?.projectDashboardLinks
          : defaultSrvUi.projectDashboardLinks,

        projectReportLinks: isDefined(userTab.ui?.projectReportLinks)
          ? userTab.ui?.projectReportLinks
          : defaultSrvUi.projectReportLinks,

        modelTreeLevels: isDefined(userTab.ui?.modelTreeLevels)
          ? userTab.ui?.modelTreeLevels
          : defaultSrvUi.modelTreeLevels
      },
      serverTs: Number(user.serverTs)
    };

    return apiUser;
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
}
