import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '~backend/config/backend-config';
import { AvatarEnt } from '~backend/drizzle/postgres/schema/avatars';
import { BranchEnt } from '~backend/drizzle/postgres/schema/branches';
import { BridgeEnt } from '~backend/drizzle/postgres/schema/bridges';
import { ChartEnt } from '~backend/drizzle/postgres/schema/charts';
import { ConnectionEnt } from '~backend/drizzle/postgres/schema/connections';
import { DashboardEnt } from '~backend/drizzle/postgres/schema/dashboards';
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
import {
  AvatarLt,
  AvatarSt,
  AvatarTab
} from '~backend/drizzle/postgres/tabs/avatar-tab';
import {
  BranchLt,
  BranchSt,
  BranchTab
} from '~backend/drizzle/postgres/tabs/branch-tab';
import {
  BridgeLt,
  BridgeSt,
  BridgeTab
} from '~backend/drizzle/postgres/tabs/bridge-tab';
import {
  ChartLt,
  ChartSt,
  ChartTab
} from '~backend/drizzle/postgres/tabs/chart-tab';
import {
  ConnectionLt,
  ConnectionSt,
  ConnectionTab
} from '~backend/drizzle/postgres/tabs/connection-tab';
import {
  DashboardLt,
  DashboardSt,
  DashboardTab
} from '~backend/drizzle/postgres/tabs/dashboard-tab';
import { EnvLt, EnvSt, EnvTab } from '~backend/drizzle/postgres/tabs/env-tab';
import { KitLt, KitSt, KitTab } from '~backend/drizzle/postgres/tabs/kit-tab';
import {
  MconfigLt,
  MconfigSt,
  MconfigTab
} from '~backend/drizzle/postgres/tabs/mconfig-tab';
import {
  MemberLt,
  MemberSt,
  MemberTab
} from '~backend/drizzle/postgres/tabs/member-tab';
import {
  ModelLt,
  ModelSt,
  ModelTab
} from '~backend/drizzle/postgres/tabs/model-tab';
import {
  NoteLt,
  NoteSt,
  NoteTab
} from '~backend/drizzle/postgres/tabs/note-tab';
import { OrgLt, OrgSt, OrgTab } from '~backend/drizzle/postgres/tabs/org-tab';
import {
  ProjectLt,
  ProjectSt,
  ProjectTab
} from '~backend/drizzle/postgres/tabs/project-tab';
import {
  QueryLt,
  QuerySt,
  QueryTab
} from '~backend/drizzle/postgres/tabs/query-tab';
import {
  ReportLt,
  ReportSt,
  ReportTab
} from '~backend/drizzle/postgres/tabs/report-tab';
import {
  StructLt,
  StructSt,
  StructTab
} from '~backend/drizzle/postgres/tabs/struct-tab';
import {
  UserLt,
  UserSt,
  UserTab
} from '~backend/drizzle/postgres/tabs/user-tab';
import { DbEntsPack } from '~backend/interfaces/db-ents-pack';
import { DbTabsPack } from '~backend/interfaces/db-tabs-pack';
import { HashService } from './hash.service';
import { TabService } from './tab.service';

@Injectable()
export class TabToEntService {
  constructor(
    private hashService: HashService,
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>
  ) {}

  tabsPackToEntsPack(tabsPack: DbTabsPack) {
    let entsPack: DbEntsPack = {
      avatars: tabsPack.avatars.map(x => this.avatarTabToEnt(x)),
      branches: tabsPack.branches.map(x => this.branchTabToEnt(x)),
      bridges: tabsPack.bridges.map(x => this.bridgeTabToEnt(x)),
      charts: tabsPack.charts.map(x => this.chartTabToEnt(x)),
      connections: tabsPack.connections.map(x => this.connectionTabToEnt(x)),
      dashboards: tabsPack.dashboards.map(x => this.dashboardTabToEnt(x)),
      envs: tabsPack.envs.map(x => this.envTabToEnt(x)),
      kits: tabsPack.kits.map(x => this.kitTabToEnt(x)),
      mconfigs: tabsPack.mconfigs.map(x => this.mconfigTabToEnt(x)),
      members: tabsPack.members.map(x => this.memberTabToEnt(x)),
      models: tabsPack.models.map(x => this.modelTabToEnt(x)),
      notes: tabsPack.notes.map(x => this.noteTabToEnt(x)),
      orgs: tabsPack.orgs.map(x => this.orgTabToEnt(x)),
      projects: tabsPack.projects.map(x => this.projectTabToEnt(x)),
      queries: tabsPack.queries.map(x => this.queryTabToEnt(x)),
      reports: tabsPack.reports.map(x => this.reportTabToEnt(x)),
      structs: tabsPack.structs.map(x => this.structTabToEnt(x)),
      users: tabsPack.users.map(x => this.userTabToEnt(x))
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
      st: this.tabService.encrypt({ data: avatarSt }),
      lt: this.tabService.encrypt({ data: avatarLt }),
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
      st: this.tabService.encrypt({ data: branchSt }),
      lt: this.tabService.encrypt({ data: branchLt }),
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
      st: this.tabService.encrypt({ data: bridgeSt }),
      lt: this.tabService.encrypt({ data: bridgeLt }),
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
      st: this.tabService.encrypt({ data: chartSt }),
      lt: this.tabService.encrypt({ data: chartLt }),
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
      st: this.tabService.encrypt({ data: connectionSt }),
      lt: this.tabService.encrypt({ data: connectionLt }),
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
      st: this.tabService.encrypt({ data: dashboardSt }),
      lt: this.tabService.encrypt({ data: dashboardLt }),
      serverTs: dashboard.serverTs
    };

    return dashboardEnt;
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
      st: this.tabService.encrypt({ data: envSt }),
      lt: this.tabService.encrypt({ data: envLt }),
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
      st: this.tabService.encrypt({ data: kitSt }),
      lt: this.tabService.encrypt({ data: kitLt }),
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
      filters: mconfig.filters,
      chart: mconfig.chart
    };

    let mconfigEnt: MconfigEnt = {
      mconfigId: mconfig.mconfigId,
      structId: mconfig.structId,
      queryId: mconfig.queryId,
      modelId: mconfig.modelId,
      modelType: mconfig.modelType,
      temp: mconfig.temp,
      st: this.tabService.encrypt({ data: mconfigSt }),
      lt: this.tabService.encrypt({ data: mconfigLt }),
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
      st: this.tabService.encrypt({ data: memberSt }),
      lt: this.tabService.encrypt({ data: memberLt }),
      emailHash: this.hashService.makeHash(member.emailHash),
      aliasHash: this.hashService.makeHash(member.aliasHash),
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
      st: this.tabService.encrypt({ data: modelSt }),
      lt: this.tabService.encrypt({ data: modelLt }),
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
      st: this.tabService.encrypt({ data: noteSt }),
      lt: this.tabService.encrypt({ data: noteLt }),
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
      st: this.tabService.encrypt({ data: orgSt }),
      lt: this.tabService.encrypt({ data: orgLt }),
      nameHash: this.hashService.makeHash(org.name),
      ownerEmailHash: this.hashService.makeHash(org.ownerEmail),
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
      st: this.tabService.encrypt({ data: projectSt }),
      lt: this.tabService.encrypt({ data: projectLt }),
      nameHash: this.hashService.makeHash(project.name),
      gitUrlHash: this.hashService.makeHash(project.gitUrl),
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
      st: this.tabService.encrypt({ data: querySt }),
      lt: this.tabService.encrypt({ data: queryLt }),
      apiUrlHash: this.hashService.makeHash(query.apiUrl),
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
      st: this.tabService.encrypt({ data: reportSt }),
      lt: this.tabService.encrypt({ data: reportLt }),
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
      st: this.tabService.encrypt({ data: structSt }),
      lt: this.tabService.encrypt({ data: structLt }),
      serverTs: struct.serverTs
    };

    return structEnt;
  }

  userTabToEnt(user: UserTab): UserEnt {
    let userSt: UserSt = {};

    let userLt: UserLt = {
      email: user.email,
      alias: user.alias,
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
      hash: user.hash,
      salt: user.salt,
      jwtMinIat: user.jwtMinIat,
      st: this.tabService.encrypt({ data: userSt }),
      lt: this.tabService.encrypt({ data: userLt }),
      emailHash: this.hashService.makeHash(user.email),
      aliasHash: this.hashService.makeHash(user.alias),
      emailVerificationTokenHash: this.hashService.makeHash(
        user.emailVerificationToken
      ),
      passwordResetTokenHash: this.hashService.makeHash(
        user.passwordResetToken
      ),

      serverTs: user.serverTs
    };

    return userEnt;
  }
}
