import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '~backend/config/backend-config';
import {
  AvatarTab,
  BranchTab,
  BridgeTab,
  ChartTab,
  ConnectionTab,
  DashboardTab,
  DconfigTab,
  EnvTab,
  KitTab,
  MconfigTab,
  MemberTab,
  ModelTab,
  NoteTab,
  OrgTab,
  ProjectTab,
  QueryTab,
  ReportTab,
  StructTab,
  UserTab
} from '~backend/drizzle/postgres/schema/_tabs';
import { AvatarEnt } from '~backend/drizzle/postgres/schema/avatars';
import { BranchEnt } from '~backend/drizzle/postgres/schema/branches';
import { BridgeEnt } from '~backend/drizzle/postgres/schema/bridges';
import { ChartEnt } from '~backend/drizzle/postgres/schema/charts';
import { ConnectionEnt } from '~backend/drizzle/postgres/schema/connections';
import { DashboardEnt } from '~backend/drizzle/postgres/schema/dashboards';
import { DconfigEnt } from '~backend/drizzle/postgres/schema/dconfigs';
import { EnvEnt } from '~backend/drizzle/postgres/schema/envs';
import { KitEnt } from '~backend/drizzle/postgres/schema/kits';
import { MconfigEnt } from '~backend/drizzle/postgres/schema/mconfigs';
import { MemberEnt } from '~backend/drizzle/postgres/schema/members';
import { ModelEnt } from '~backend/drizzle/postgres/schema/models';
import { NoteEnt } from '~backend/drizzle/postgres/schema/notes';
import { OrgEnt } from '~backend/drizzle/postgres/schema/orgs';
import { ProjectEnt } from '~backend/drizzle/postgres/schema/projects';
import { QueryEnt } from '~backend/drizzle/postgres/schema/queries';
import { ReportEnt } from '~backend/drizzle/postgres/schema/reports';
import { StructEnt } from '~backend/drizzle/postgres/schema/structs';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { DbEntsPack } from '~backend/interfaces/db-ents-pack';
import { DbTabsPack } from '~backend/interfaces/db-tabs-pack';
import { BoolEnum } from '~common/enums/bool.enum';
import { isDefined } from '~common/functions/is-defined';
import {
  AvatarLt,
  AvatarSt,
  BranchLt,
  BranchSt,
  BridgeLt,
  BridgeSt,
  ChartLt,
  ChartSt,
  ConnectionLt,
  ConnectionSt,
  DashboardLt,
  DashboardSt,
  DconfigLt,
  DconfigSt,
  EnvLt,
  EnvSt,
  KitLt,
  KitSt,
  MconfigLt,
  MconfigSt,
  MemberLt,
  MemberSt,
  ModelLt,
  ModelSt,
  NoteLt,
  NoteSt,
  OrgLt,
  OrgSt,
  ProjectLt,
  ProjectSt,
  QueryLt,
  QuerySt,
  ReportLt,
  ReportSt,
  StructLt,
  StructSt,
  UserLt,
  UserSt
} from '~common/interfaces/st-lt';
import { HashService } from './hash.service';
import { TabService } from './tab.service';

@Injectable()
export class TabToEntService {
  private aesKeyTag: string;
  private isEncryption: boolean;

  constructor(
    private hashService: HashService,
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>
  ) {
    this.aesKeyTag = this.cs.get<BackendConfig['aesKeyTag']>('aesKeyTag');

    this.isEncryption =
      this.cs.get<BackendConfig['isDbEncryptionEnabled']>(
        'isDbEncryptionEnabled'
      ) === BoolEnum.TRUE;
  }

  tabsPackToEntsPack(tabsPack: DbTabsPack) {
    let entsPack: DbEntsPack = {
      avatars:
        tabsPack.avatars
          ?.filter(x => isDefined(x))
          .map(x => this.avatarTabToEnt(x)) ?? [],
      branches:
        tabsPack.branches
          ?.filter(x => isDefined(x))
          .map(x => this.branchTabToEnt(x)) ?? [],
      bridges:
        tabsPack.bridges
          ?.filter(x => isDefined(x))
          .map(x => this.bridgeTabToEnt(x)) ?? [],
      charts:
        tabsPack.charts
          ?.filter(x => isDefined(x))
          .map(x => this.chartTabToEnt(x)) ?? [],
      connections:
        tabsPack.connections
          ?.filter(x => isDefined(x))
          .map(x => this.connectionTabToEnt(x)) ?? [],
      dashboards:
        tabsPack.dashboards
          ?.filter(x => isDefined(x))
          .map(x => this.dashboardTabToEnt(x)) ?? [],
      dconfigs:
        tabsPack.dconfigs
          ?.filter(x => isDefined(x))
          .map(x => this.dconfigTabToEnt(x)) ?? [],
      envs:
        tabsPack.envs
          ?.filter(x => isDefined(x))
          .map(x => this.envTabToEnt(x)) ?? [],
      kits:
        tabsPack.kits
          ?.filter(x => isDefined(x))
          .map(x => this.kitTabToEnt(x)) ?? [],
      mconfigs:
        tabsPack.mconfigs
          ?.filter(x => isDefined(x))
          .map(x => this.mconfigTabToEnt(x)) ?? [],
      members:
        tabsPack.members
          ?.filter(x => isDefined(x))
          .map(x => this.memberTabToEnt(x)) ?? [],
      models:
        tabsPack.models
          ?.filter(x => isDefined(x))
          .map(x => this.modelTabToEnt(x)) ?? [],
      notes:
        tabsPack.notes
          ?.filter(x => isDefined(x))
          .map(x => this.noteTabToEnt(x)) ?? [],
      orgs:
        tabsPack.orgs
          ?.filter(x => isDefined(x))
          .map(x => this.orgTabToEnt(x)) ?? [],
      projects:
        tabsPack.projects
          ?.filter(x => isDefined(x))
          .map(x => this.projectTabToEnt(x)) ?? [],
      queries:
        tabsPack.queries
          ?.filter(x => isDefined(x))
          .map(x => this.queryTabToEnt(x)) ?? [],
      reports:
        tabsPack.reports
          ?.filter(x => isDefined(x))
          .map(x => this.reportTabToEnt(x)) ?? [],
      structs:
        tabsPack.structs
          ?.filter(x => isDefined(x))
          .map(x => this.structTabToEnt(x)) ?? [],
      users:
        tabsPack.users
          ?.filter(x => isDefined(x))
          .map(x => this.userTabToEnt(x)) ?? []
    };

    return entsPack;
  }

  avatarTabToEnt(avatar: AvatarTab): AvatarEnt {
    let avatarSt: AvatarSt = {
      avatarSmall: avatar.avatarSmall
    };
    let avatarLt: AvatarLt = {
      avatarBig: avatar.avatarBig
    };

    let avatarEnt: AvatarEnt = {
      userId: avatar.userId,
      ...this.tabService.getEntProps({ dataSt: avatarSt, dataLt: avatarLt }),
      keyTag: this.aesKeyTag,
      serverTs: avatar.serverTs
    };

    return avatarEnt;
  }

  branchTabToEnt(branch: BranchTab): BranchEnt {
    let branchSt: BranchSt = {};
    let branchLt: BranchLt = {};

    let branchEnt: BranchEnt = {
      branchFullId: this.hashService.makeBranchFullId({
        projectId: branch.projectId,
        repoId: branch.repoId,
        branchId: branch.branchId
      }),
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
      ...this.tabService.getEntProps({ dataSt: branchSt, dataLt: branchLt }),
      keyTag: this.aesKeyTag,
      serverTs: branch.serverTs
    };

    return branchEnt;
  }

  bridgeTabToEnt(bridge: BridgeTab): BridgeEnt {
    let bridgeSt: BridgeSt = {};
    let bridgeLt: BridgeLt = {};

    let bridgeEnt: BridgeEnt = {
      bridgeFullId: this.hashService.makeBridgeFullId({
        projectId: bridge.projectId,
        repoId: bridge.repoId,
        branchId: bridge.branchId,
        envId: bridge.envId
      }),
      projectId: bridge.projectId,
      repoId: bridge.repoId,
      branchId: bridge.branchId,
      envId: bridge.envId,
      structId: bridge.structId,
      needValidate: bridge.needValidate,
      ...this.tabService.getEntProps({ dataSt: bridgeSt, dataLt: bridgeLt }),
      keyTag: this.aesKeyTag,
      serverTs: bridge.serverTs
    };

    return bridgeEnt;
  }

  chartTabToEnt(chart: ChartTab): ChartEnt {
    let chartSt: ChartSt = {
      title: chart.title,
      modelLabel: chart.modelLabel,
      filePath: chart.filePath,
      accessRoles: chart.accessRoles,
      tiles: chart.tiles
    };

    let chartLt: ChartLt = {};

    let chartEnt: ChartEnt = {
      chartFullId: this.hashService.makeChartFullId({
        structId: chart.structId,
        chartId: chart.chartId
      }),
      structId: chart.structId,
      chartId: chart.chartId,
      modelId: chart.modelId,
      creatorId: chart.creatorId,
      chartType: chart.chartType,
      draft: chart.draft,
      ...this.tabService.getEntProps({ dataSt: chartSt, dataLt: chartLt }),
      keyTag: this.aesKeyTag,
      serverTs: chart.serverTs
    };

    return chartEnt;
  }

  connectionTabToEnt(connection: ConnectionTab): ConnectionEnt {
    let connectionSt: ConnectionSt = { options: connection.options };
    let connectionLt: ConnectionLt = {};

    let connectionEnt: ConnectionEnt = {
      connectionFullId: this.hashService.makeConnectionFullId({
        projectId: connection.projectId,
        envId: connection.envId,
        connectionId: connection.connectionId
      }),
      projectId: connection.projectId,
      envId: connection.envId,
      connectionId: connection.connectionId,
      type: connection.type,
      ...this.tabService.getEntProps({
        dataSt: connectionSt,
        dataLt: connectionLt
      }),
      keyTag: this.aesKeyTag,
      serverTs: undefined
    };

    return connectionEnt;
  }

  dashboardTabToEnt(dashboard: DashboardTab): DashboardEnt {
    let dashboardSt: DashboardSt = {
      title: dashboard.title,
      filePath: dashboard.filePath,
      accessRoles: dashboard.accessRoles,
      tiles: dashboard.tiles,
      fields: dashboard.fields
    };
    let dashboardLt: DashboardLt = { content: dashboard.content };

    let dashboardEnt: DashboardEnt = {
      dashboardFullId: this.hashService.makeDashboardFullId({
        structId: dashboard.structId,
        dashboardId: dashboard.dashboardId
      }),
      structId: dashboard.structId,
      dashboardId: dashboard.dashboardId,
      creatorId: dashboard.creatorId,
      draft: dashboard.draft,
      ...this.tabService.getEntProps({
        dataSt: dashboardSt,
        dataLt: dashboardLt
      }),
      keyTag: this.aesKeyTag,
      serverTs: dashboard.serverTs
    };

    return dashboardEnt;
  }

  dconfigTabToEnt(dconfig: DconfigTab): DconfigEnt {
    let dconfigSt: DconfigSt = {
      hashSecret: dconfig.hashSecret
    };
    let dconfigLt: DconfigLt = {};

    let dconfigEnt: DconfigEnt = {
      dconfigId: dconfig.dconfigId,
      ...this.tabService.getEntProps({ dataSt: dconfigSt, dataLt: dconfigLt }),
      keyTag: this.aesKeyTag,
      serverTs: dconfig.serverTs
    };

    return dconfigEnt;
  }

  envTabToEnt(env: EnvTab): EnvEnt {
    let envSt: EnvSt = { evs: env.evs };
    let envLt: EnvLt = {};

    let envEnt: EnvEnt = {
      envFullId: this.hashService.makeEnvFullId({
        projectId: env.projectId,
        envId: env.envId
      }),
      projectId: env.projectId,
      envId: env.envId,
      memberIds: env.memberIds,
      isFallbackToProdConnections: env.isFallbackToProdConnections,
      isFallbackToProdVariables: env.isFallbackToProdVariables,
      ...this.tabService.getEntProps({ dataSt: envSt, dataLt: envLt }),
      keyTag: this.aesKeyTag,
      serverTs: env.serverTs
    };

    return envEnt;
  }

  kitTabToEnt(kit: KitTab): KitEnt {
    let kitSt: KitSt = {};
    let kitLt: KitLt = {
      data: kit.data
    };

    let kitEnt: KitEnt = {
      kitId: kit.kitId,
      structId: kit.structId,
      reportId: kit.reportId,
      ...this.tabService.getEntProps({ dataSt: kitSt, dataLt: kitLt }),
      keyTag: this.aesKeyTag,
      serverTs: kit.serverTs
    };

    return kitEnt;
  }

  mconfigTabToEnt(mconfig: MconfigTab): MconfigEnt {
    let mconfigSt: MconfigSt = {};

    let mconfigLt: MconfigLt = {
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
      filters: mconfig?.filters,
      chart: mconfig.chart
    };

    let mconfigEnt: MconfigEnt = {
      mconfigId: mconfig.mconfigId,
      structId: mconfig.structId,
      queryId: mconfig.queryId,
      modelId: mconfig.modelId,
      modelType: mconfig.modelType,
      ...this.tabService.getEntProps({ dataSt: mconfigSt, dataLt: mconfigLt }),
      keyTag: this.aesKeyTag,
      serverTs: mconfig.serverTs
    };

    return mconfigEnt;
  }

  memberTabToEnt(member: MemberTab): MemberEnt {
    let memberSt: MemberSt = {
      email: member.email,
      alias: member.alias,
      firstName: member.firstName,
      lastName: member.lastName,
      roles: member.roles
    };

    let memberLt: MemberLt = {};

    let memberEnt: MemberEnt = {
      memberFullId: this.hashService.makeMemberFullId({
        projectId: member.projectId,
        memberId: member.memberId
      }),
      projectId: member.projectId,
      memberId: member.memberId,
      isAdmin: member.isAdmin,
      isEditor: member.isEditor,
      isExplorer: member.isExplorer,
      ...this.tabService.getEntProps({ dataSt: memberSt, dataLt: memberLt }),
      keyTag: this.aesKeyTag,
      emailHash: this.hashService.makeHash({
        input: member.emailHash
      }),
      aliasHash: this.hashService.makeHash({
        input: member.aliasHash
      }),
      serverTs: member.serverTs
    };

    return memberEnt;
  }

  modelTabToEnt(model: ModelTab): ModelEnt {
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
      ...this.tabService.getEntProps({ dataSt: modelSt, dataLt: modelLt }),
      keyTag: this.aesKeyTag,
      serverTs: model.serverTs
    };

    return modelEnt;
  }

  noteTabToEnt(note: NoteTab): NoteEnt {
    let noteSt: NoteSt = {};
    let noteLt: NoteLt = {
      privateKey: note.privateKey,
      publicKey: note.publicKey
    };

    let noteEnt: NoteEnt = {
      noteId: note.noteId,
      ...this.tabService.getEntProps({ dataSt: noteSt, dataLt: noteLt }),
      keyTag: this.aesKeyTag,
      serverTs: note.serverTs
    };

    return noteEnt;
  }

  orgTabToEnt(org: OrgTab): OrgEnt {
    let orgSt: OrgSt = {
      name: org.name,
      ownerEmail: org.ownerEmail
    };

    let orgLt: OrgLt = {};

    let orgEnt: OrgEnt = {
      orgId: org.orgId,
      ownerId: org.ownerId,
      ...this.tabService.getEntProps({ dataSt: orgSt, dataLt: orgLt }),
      keyTag: this.aesKeyTag,
      nameHash: this.hashService.makeHash({
        input: org.name
      }),
      ownerEmailHash: this.hashService.makeHash({
        input: org.ownerEmail
      }),
      serverTs: org.serverTs
    };

    return orgEnt;
  }

  projectTabToEnt(project: ProjectTab): ProjectEnt {
    let projectSt: ProjectSt = {
      name: project.name
    };

    let projectLt: ProjectLt = {
      defaultBranch: project.defaultBranch,
      gitUrl: project.gitUrl,
      privateKey: project.privateKey,
      publicKey: project.publicKey
    };

    let projectEnt: ProjectEnt = {
      projectId: project.projectId,
      orgId: project.orgId,
      remoteType: project.remoteType,
      ...this.tabService.getEntProps({ dataSt: projectSt, dataLt: projectLt }),
      keyTag: this.aesKeyTag,
      nameHash: this.hashService.makeHash({
        input: project.name
      }),
      gitUrlHash: this.hashService.makeHash({
        input: project.gitUrl
      }),
      serverTs: project.serverTs
    };

    return projectEnt;
  }

  queryTabToEnt(query: QueryTab): QueryEnt {
    let querySt: QuerySt = {
      sql: query.sql,
      apiMethod: query.apiMethod,
      apiUrl: query.apiUrl,
      apiBody: query.apiBody,
      lastErrorMessage: query.lastErrorMessage
    };

    let queryLt: QueryLt = {
      data: query.data
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
      queryJobId: query.queryJobId,
      bigqueryQueryJobId: query.bigqueryQueryJobId,
      bigqueryConsecutiveErrorsGetJob: query.bigqueryConsecutiveErrorsGetJob,
      bigqueryConsecutiveErrorsGetResults:
        query.bigqueryConsecutiveErrorsGetResults,
      ...this.tabService.getEntProps({ dataSt: querySt, dataLt: queryLt }),
      keyTag: this.aesKeyTag,
      apiUrlHash: this.hashService.makeHash({
        input: query.apiUrl
      }),
      serverTs: query.serverTs
    };

    return queryEnt;
  }

  reportTabToEnt(report: ReportTab): ReportEnt {
    let reportSt: ReportSt = {
      filePath: report.filePath,
      fields: report.fields,
      accessRoles: report.accessRoles,
      title: report.title,
      chart: report.chart
    };

    let reportLt: ReportLt = {
      rows: report.rows
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
      ...this.tabService.getEntProps({ dataSt: reportSt, dataLt: reportLt }),
      keyTag: this.aesKeyTag,
      serverTs: report.serverTs
    };

    return reportEnt;
  }

  structTabToEnt(struct: StructTab): StructEnt {
    let structSt: StructSt = {};

    let structLt: StructLt = {
      errors: struct.errors,
      metrics: struct.metrics,
      presets: struct.presets,
      mproveConfig: struct.mproveConfig
    };

    let structEnt: StructEnt = {
      structId: struct.structId,
      projectId: struct.projectId,
      mproveVersion: struct.mproveVersion,
      ...this.tabService.getEntProps({ dataSt: structSt, dataLt: structLt }),
      keyTag: this.aesKeyTag,
      serverTs: struct.serverTs
    };

    return structEnt;
  }

  userTabToEnt(user: UserTab): UserEnt {
    let userSt: UserSt = {};

    let userLt: UserLt = {
      email: user.email,
      alias: user.alias,
      passwordHash: user.passwordHash,
      passwordSalt: user.passwordSalt,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerificationToken: user.emailVerificationToken,
      passwordResetToken: user.passwordResetToken,
      passwordResetExpiresTs: user.passwordResetExpiresTs,
      ui: user.ui
    };

    let userEnt: UserEnt = {
      userId: user.userId,
      isEmailVerified: user.isEmailVerified,
      jwtMinIat: user.jwtMinIat,
      ...this.tabService.getEntProps({ dataSt: userSt, dataLt: userLt }),
      keyTag: this.aesKeyTag,
      emailHash: this.hashService.makeHash({
        input: user.email
      }),
      aliasHash: this.hashService.makeHash({
        input: user.alias
      }),
      emailVerificationTokenHash: this.hashService.makeHash({
        input: user.emailVerificationToken
      }),
      passwordResetTokenHash: this.hashService.makeHash({
        input: user.passwordResetToken
      }),

      serverTs: user.serverTs
    };

    return userEnt;
  }
}
