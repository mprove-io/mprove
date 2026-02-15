import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '#backend/config/backend-config';
import type {
  AvatarTab,
  BranchTab,
  BridgeTab,
  ChartTab,
  ConnectionTab,
  DashboardTab,
  DconfigTab,
  EnvTab,
  EventTab,
  KitTab,
  MconfigTab,
  MemberTab,
  ModelTab,
  NoteTab,
  OrgTab,
  ProjectTab,
  QueryTab,
  ReportTab,
  SessionTab,
  StructTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { AvatarEnt } from '#backend/drizzle/postgres/schema/avatars';
import { BranchEnt } from '#backend/drizzle/postgres/schema/branches';
import { BridgeEnt } from '#backend/drizzle/postgres/schema/bridges';
import { ChartEnt } from '#backend/drizzle/postgres/schema/charts';
import { ConnectionEnt } from '#backend/drizzle/postgres/schema/connections';
import { DashboardEnt } from '#backend/drizzle/postgres/schema/dashboards';
import { DconfigEnt } from '#backend/drizzle/postgres/schema/dconfigs';
import { EnvEnt } from '#backend/drizzle/postgres/schema/envs';
import { EventEnt } from '#backend/drizzle/postgres/schema/events';
import { KitEnt } from '#backend/drizzle/postgres/schema/kits';
import { MconfigEnt } from '#backend/drizzle/postgres/schema/mconfigs';
import { MemberEnt } from '#backend/drizzle/postgres/schema/members';
import { ModelEnt } from '#backend/drizzle/postgres/schema/models';
import { NoteEnt } from '#backend/drizzle/postgres/schema/notes';
import { OrgEnt } from '#backend/drizzle/postgres/schema/orgs';
import { ProjectEnt } from '#backend/drizzle/postgres/schema/projects';
import { QueryEnt } from '#backend/drizzle/postgres/schema/queries';
import { ReportEnt } from '#backend/drizzle/postgres/schema/reports';
import { SessionEnt } from '#backend/drizzle/postgres/schema/sessions';
import { StructEnt } from '#backend/drizzle/postgres/schema/structs';
import { UserEnt } from '#backend/drizzle/postgres/schema/users';
import { DbEntsPack } from '#backend/interfaces/db-ents-pack';
import { DbTabsPack } from '#backend/interfaces/db-tabs-pack';
import { isDefined } from '#common/functions/is-defined';
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
  EventLt,
  EventSt,
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
  SessionLt,
  SessionSt,
  StructLt,
  StructSt,
  UserLt,
  UserSt
} from '#common/interfaces/st-lt';
import { encryptData } from '#node-common/functions/encrypt-decrypt';
import { HashService } from './hash.service';

@Injectable()
export class TabToEntService {
  private keyBuffer: Buffer;
  private keyTag: string;
  private isEncryptDb: boolean;
  private isEncryptMetadata: boolean;

  constructor(
    private hashService: HashService,
    private cs: ConfigService<BackendConfig>
  ) {
    let keyBase64 = this.cs.get<BackendConfig['aesKey']>('aesKey');
    this.keyBuffer = Buffer.from(keyBase64, 'base64');

    this.keyTag = this.cs.get<BackendConfig['aesKeyTag']>('aesKeyTag');

    this.isEncryptDb = this.cs.get<BackendConfig['isEncryptDb']>('isEncryptDb');

    this.isEncryptMetadata =
      this.cs.get<BackendConfig['isEncryptMetadata']>('isEncryptMetadata');
  }

  tabsPackToEntsPack(item: { tabsPack: DbTabsPack; hashSecret: string }) {
    let { tabsPack, hashSecret } = item;

    let entsPack: DbEntsPack = {
      avatars:
        tabsPack.avatars
          ?.filter(x => isDefined(x))
          .map(x => this.avatarTabToEnt({ tab: x, hashSecret: hashSecret })) ??
        [],
      branches:
        tabsPack.branches
          ?.filter(x => isDefined(x))
          .map(x => this.branchTabToEnt({ tab: x, hashSecret: hashSecret })) ??
        [],
      bridges:
        tabsPack.bridges
          ?.filter(x => isDefined(x))
          .map(x => this.bridgeTabToEnt({ tab: x, hashSecret: hashSecret })) ??
        [],
      charts:
        tabsPack.charts
          ?.filter(x => isDefined(x))
          .map(x => this.chartTabToEnt({ tab: x, hashSecret: hashSecret })) ??
        [],
      connections:
        tabsPack.connections
          ?.filter(x => isDefined(x))
          .map(x =>
            this.connectionTabToEnt({ tab: x, hashSecret: hashSecret })
          ) ?? [],
      dashboards:
        tabsPack.dashboards
          ?.filter(x => isDefined(x))
          .map(x =>
            this.dashboardTabToEnt({ tab: x, hashSecret: hashSecret })
          ) ?? [],
      dconfigs:
        tabsPack.dconfigs
          ?.filter(x => isDefined(x))
          .map(x => this.dconfigTabToEnt({ tab: x, hashSecret: hashSecret })) ??
        [],
      envs:
        tabsPack.envs
          ?.filter(x => isDefined(x))
          .map(x => this.envTabToEnt({ tab: x, hashSecret: hashSecret })) ?? [],
      kits:
        tabsPack.kits
          ?.filter(x => isDefined(x))
          .map(x => this.kitTabToEnt({ tab: x, hashSecret: hashSecret })) ?? [],
      mconfigs:
        tabsPack.mconfigs
          ?.filter(x => isDefined(x))
          .map(x => this.mconfigTabToEnt({ tab: x, hashSecret: hashSecret })) ??
        [],
      members:
        tabsPack.members
          ?.filter(x => isDefined(x))
          .map(x => this.memberTabToEnt({ tab: x, hashSecret: hashSecret })) ??
        [],
      models:
        tabsPack.models
          ?.filter(x => isDefined(x))
          .map(x => this.modelTabToEnt({ tab: x, hashSecret: hashSecret })) ??
        [],
      notes:
        tabsPack.notes
          ?.filter(x => isDefined(x))
          .map(x => this.noteTabToEnt({ tab: x, hashSecret: hashSecret })) ??
        [],
      orgs:
        tabsPack.orgs
          ?.filter(x => isDefined(x))
          .map(x => this.orgTabToEnt({ tab: x, hashSecret: hashSecret })) ?? [],
      projects:
        tabsPack.projects
          ?.filter(x => isDefined(x))
          .map(x => this.projectTabToEnt({ tab: x, hashSecret: hashSecret })) ??
        [],
      queries:
        tabsPack.queries
          ?.filter(x => isDefined(x))
          .map(x => this.queryTabToEnt({ tab: x, hashSecret: hashSecret })) ??
        [],
      reports:
        tabsPack.reports
          ?.filter(x => isDefined(x))
          .map(x => this.reportTabToEnt({ tab: x, hashSecret: hashSecret })) ??
        [],
      structs:
        tabsPack.structs
          ?.filter(x => isDefined(x))
          .map(x => this.structTabToEnt({ tab: x, hashSecret: hashSecret })) ??
        [],
      users:
        tabsPack.users
          ?.filter(x => isDefined(x))
          .map(x => this.userTabToEnt({ tab: x, hashSecret: hashSecret })) ??
        [],
      events:
        tabsPack.events
          ?.filter(x => isDefined(x))
          .map(x => this.eventTabToEnt({ tab: x, hashSecret: hashSecret })) ??
        [],
      sessions:
        tabsPack.sessions
          ?.filter(x => isDefined(x))
          .map(x => this.sessionTabToEnt({ tab: x, hashSecret: hashSecret })) ??
        []
    };

    return entsPack;
  }

  getEntProps<DataSt, DataLt>(item: {
    dataSt: DataSt;
    dataLt: DataLt;
    isMetadata: boolean;
  }) {
    let { dataSt, dataLt, isMetadata } = item;

    let isEncrypt =
      isMetadata === true
        ? this.isEncryptDb === true && this.isEncryptMetadata === true
        : this.isEncryptDb === true;

    return isEncrypt === true
      ? {
          st: {
            encrypted: this.encrypt({ data: dataSt }),
            decrypted: undefined as DataSt
          },
          lt: {
            encrypted: this.encrypt({ data: dataLt }),
            decrypted: undefined as DataLt
          },
          keyTag: this.keyTag
        }
      : {
          st: {
            encrypted: undefined as string,
            decrypted: dataSt
          },
          lt: {
            encrypted: undefined as string,
            decrypted: dataLt
          },
          keyTag: undefined
        };
  }

  encrypt(item: { data: any }) {
    let { data } = item;

    return encryptData({
      data: data,
      keyBuffer: this.keyBuffer
    });
  }

  avatarTabToEnt(item: { tab: AvatarTab; hashSecret: string }): AvatarEnt {
    let { tab, hashSecret } = item;

    let avatarSt: AvatarSt = {
      avatarSmall: tab.avatarSmall
    };
    let avatarLt: AvatarLt = {
      avatarBig: tab.avatarBig
    };

    let avatarEnt: AvatarEnt = {
      userId: tab.userId,
      ...this.getEntProps({
        dataSt: avatarSt,
        dataLt: avatarLt,
        isMetadata: false
      }),
      serverTs: tab.serverTs
    };

    return avatarEnt;
  }

  branchTabToEnt(item: { tab: BranchTab; hashSecret: string }): BranchEnt {
    let { tab, hashSecret } = item;

    let branchSt: BranchSt = {};
    let branchLt: BranchLt = {};

    let branchEnt: BranchEnt = {
      branchFullId: this.hashService.makeBranchFullId({
        projectId: tab.projectId,
        repoId: tab.repoId,
        branchId: tab.branchId
      }),
      projectId: tab.projectId,
      repoId: tab.repoId,
      branchId: tab.branchId,
      ...this.getEntProps({
        dataSt: branchSt,
        dataLt: branchLt,
        isMetadata: false
      }),
      serverTs: tab.serverTs
    };

    return branchEnt;
  }

  bridgeTabToEnt(item: { tab: BridgeTab; hashSecret: string }): BridgeEnt {
    let { tab, hashSecret } = item;

    let bridgeSt: BridgeSt = {};
    let bridgeLt: BridgeLt = {};

    let bridgeEnt: BridgeEnt = {
      bridgeFullId: this.hashService.makeBridgeFullId({
        projectId: tab.projectId,
        repoId: tab.repoId,
        branchId: tab.branchId,
        envId: tab.envId
      }),
      projectId: tab.projectId,
      repoId: tab.repoId,
      branchId: tab.branchId,
      envId: tab.envId,
      structId: tab.structId,
      needValidate: tab.needValidate,
      ...this.getEntProps({
        dataSt: bridgeSt,
        dataLt: bridgeLt,
        isMetadata: false
      }),
      serverTs: tab.serverTs
    };

    return bridgeEnt;
  }

  chartTabToEnt(item: { tab: ChartTab; hashSecret: string }): ChartEnt {
    let { tab, hashSecret } = item;

    let chartSt: ChartSt = {
      title: tab.title,
      modelLabel: tab.modelLabel,
      filePath: tab.filePath,
      tiles: tab.tiles
    };

    let chartLt: ChartLt = {};

    let chartEnt: ChartEnt = {
      chartFullId: this.hashService.makeChartFullId({
        structId: tab.structId,
        chartId: tab.chartId
      }),
      structId: tab.structId,
      chartId: tab.chartId,
      modelId: tab.modelId,
      creatorId: tab.creatorId,
      chartType: tab.chartType,
      draft: tab.draft,
      ...this.getEntProps({
        dataSt: chartSt,
        dataLt: chartLt,
        isMetadata: true
      }),
      serverTs: tab.serverTs
    };

    return chartEnt;
  }

  connectionTabToEnt(item: {
    tab: ConnectionTab;
    hashSecret: string;
  }): ConnectionEnt {
    let { tab, hashSecret } = item;

    let connectionSt: ConnectionSt = { options: tab.options };
    let connectionLt: ConnectionLt = {};

    let connectionEnt: ConnectionEnt = {
      connectionFullId: this.hashService.makeConnectionFullId({
        projectId: tab.projectId,
        envId: tab.envId,
        connectionId: tab.connectionId
      }),
      projectId: tab.projectId,
      envId: tab.envId,
      connectionId: tab.connectionId,
      type: tab.type,
      ...this.getEntProps({
        dataSt: connectionSt,
        dataLt: connectionLt,
        isMetadata: false
      }),
      serverTs: undefined
    };

    return connectionEnt;
  }

  dashboardTabToEnt(item: {
    tab: DashboardTab;
    hashSecret: string;
  }): DashboardEnt {
    let { tab, hashSecret } = item;

    let dashboardSt: DashboardSt = {
      title: tab.title,
      filePath: tab.filePath,
      accessRoles: tab.accessRoles,
      tiles: tab.tiles,
      fields: tab.fields
    };
    let dashboardLt: DashboardLt = { content: tab.content };

    let dashboardEnt: DashboardEnt = {
      dashboardFullId: this.hashService.makeDashboardFullId({
        structId: tab.structId,
        dashboardId: tab.dashboardId
      }),
      structId: tab.structId,
      dashboardId: tab.dashboardId,
      creatorId: tab.creatorId,
      draft: tab.draft,
      ...this.getEntProps({
        dataSt: dashboardSt,
        dataLt: dashboardLt,
        isMetadata: true
      }),
      serverTs: tab.serverTs
    };

    return dashboardEnt;
  }

  dconfigTabToEnt(item: { tab: DconfigTab; hashSecret: string }): DconfigEnt {
    let { tab, hashSecret } = item;

    let dconfigSt: DconfigSt = {
      hashSecret: tab.hashSecret,
      hashSecretCheck: tab.hashSecretCheck
    };
    let dconfigLt: DconfigLt = {};

    let dconfigEnt: DconfigEnt = {
      dconfigId: tab.dconfigId,
      ...this.getEntProps({
        dataSt: dconfigSt,
        dataLt: dconfigLt,
        isMetadata: false
      }),
      serverTs: tab.serverTs
    };

    return dconfigEnt;
  }

  envTabToEnt(item: { tab: EnvTab; hashSecret: string }): EnvEnt {
    let { tab, hashSecret } = item;

    let envSt: EnvSt = { evs: tab.evs };
    let envLt: EnvLt = {};

    let envEnt: EnvEnt = {
      envFullId: this.hashService.makeEnvFullId({
        projectId: tab.projectId,
        envId: tab.envId
      }),
      projectId: tab.projectId,
      envId: tab.envId,
      memberIds: tab.memberIds,
      isFallbackToProdConnections: tab.isFallbackToProdConnections,
      isFallbackToProdVariables: tab.isFallbackToProdVariables,
      ...this.getEntProps({
        dataSt: envSt,
        dataLt: envLt,
        isMetadata: false
      }),
      serverTs: tab.serverTs
    };

    return envEnt;
  }

  kitTabToEnt(item: { tab: KitTab; hashSecret: string }): KitEnt {
    let { tab, hashSecret } = item;

    let kitSt: KitSt = {};
    let kitLt: KitLt = {
      data: tab.data
    };

    let kitEnt: KitEnt = {
      kitId: tab.kitId,
      structId: tab.structId,
      reportId: tab.reportId,
      ...this.getEntProps({
        dataSt: kitSt,
        dataLt: kitLt,
        isMetadata: false
      }),
      serverTs: tab.serverTs
    };

    return kitEnt;
  }

  mconfigTabToEnt(item: { tab: MconfigTab; hashSecret: string }): MconfigEnt {
    let { tab, hashSecret } = item;

    let mconfigSt: MconfigSt = {};

    let mconfigLt: MconfigLt = {
      dateRangeIncludesRightSide: tab.dateRangeIncludesRightSide,
      storePart: tab.storePart,
      modelLabel: tab.modelLabel,
      modelFilePath: tab.modelFilePath,
      malloyQueryStable: tab.malloyQueryStable,
      malloyQueryExtra: tab.malloyQueryExtra,
      compiledQuery: tab.compiledQuery,
      select: tab.select,
      sortings: tab.sortings,
      sorts: tab.sorts,
      timezone: tab.timezone,
      limit: tab.limit,
      filters: tab.filters,
      chart: tab.chart
    };

    let mconfigEnt: MconfigEnt = {
      mconfigId: tab.mconfigId,
      structId: tab.structId,
      queryId: tab.queryId,
      modelId: tab.modelId,
      modelType: tab.modelType,
      parentType: tab.parentType,
      parentId: tab.parentId,
      ...this.getEntProps({
        dataSt: mconfigSt,
        dataLt: mconfigLt,
        isMetadata: true
      }),
      serverTs: tab.serverTs
    };

    return mconfigEnt;
  }

  memberTabToEnt(item: { tab: MemberTab; hashSecret: string }): MemberEnt {
    let { tab, hashSecret } = item;

    let memberSt: MemberSt = {
      email: tab.email,
      alias: tab.alias,
      firstName: tab.firstName,
      lastName: tab.lastName,
      roles: tab.roles
    };

    let memberLt: MemberLt = {};

    let memberEnt: MemberEnt = {
      memberFullId: this.hashService.makeMemberFullId({
        projectId: tab.projectId,
        memberId: tab.memberId
      }),
      projectId: tab.projectId,
      memberId: tab.memberId,
      isAdmin: tab.isAdmin,
      isEditor: tab.isEditor,
      isExplorer: tab.isExplorer,
      ...this.getEntProps({
        dataSt: memberSt,
        dataLt: memberLt,
        isMetadata: false
      }),
      emailHash: this.hashService.makeHash({
        input: tab.email,
        hashSecret: hashSecret
      }),
      aliasHash: this.hashService.makeHash({
        input: tab.alias,
        hashSecret: hashSecret
      }),
      serverTs: tab.serverTs
    };

    return memberEnt;
  }

  modelTabToEnt(item: { tab: ModelTab; hashSecret: string }): ModelEnt {
    let { tab, hashSecret } = item;

    let modelSt: ModelSt = {
      accessRoles: tab.accessRoles
    };

    let modelLt: ModelLt = {
      source: tab.source,
      malloyModelDef: tab.malloyModelDef,
      filePath: tab.filePath,
      fileText: tab.fileText,
      storeContent: tab.storeContent,
      dateRangeIncludesRightSide: tab.dateRangeIncludesRightSide,
      label: tab.label,
      fields: tab.fields,
      nodes: tab.nodes
    };

    let modelEnt: ModelEnt = {
      modelFullId: this.hashService.makeModelFullId({
        structId: tab.structId,
        modelId: tab.modelId
      }),
      structId: tab.structId,
      modelId: tab.modelId,
      type: tab.type,
      connectionId: tab.connectionId,
      connectionType: tab.connectionType,
      ...this.getEntProps({
        dataSt: modelSt,
        dataLt: modelLt,
        isMetadata: true
      }),
      serverTs: tab.serverTs
    };

    return modelEnt;
  }

  noteTabToEnt(item: { tab: NoteTab; hashSecret: string }): NoteEnt {
    let { tab, hashSecret } = item;

    let noteSt: NoteSt = {};
    let noteLt: NoteLt = {
      publicKey: tab.publicKey,
      privateKey: tab.privateKey,
      publicKeyEncrypted: tab.publicKeyEncrypted,
      privateKeyEncrypted: tab.privateKeyEncrypted,
      passPhrase: tab.passPhrase
    };

    let noteEnt: NoteEnt = {
      noteId: tab.noteId,
      ...this.getEntProps({
        dataSt: noteSt,
        dataLt: noteLt,
        isMetadata: false
      }),
      serverTs: tab.serverTs
    };

    return noteEnt;
  }

  orgTabToEnt(item: { tab: OrgTab; hashSecret: string }): OrgEnt {
    let { tab, hashSecret } = item;

    let orgSt: OrgSt = {
      name: tab.name,
      ownerEmail: tab.ownerEmail
    };

    let orgLt: OrgLt = {};

    let orgEnt: OrgEnt = {
      orgId: tab.orgId,
      ownerId: tab.ownerId,
      ...this.getEntProps({
        dataSt: orgSt,
        dataLt: orgLt,
        isMetadata: false
      }),
      nameHash: this.hashService.makeHash({
        input: tab.name,
        hashSecret: hashSecret
      }),
      ownerEmailHash: this.hashService.makeHash({
        input: tab.ownerEmail,
        hashSecret: hashSecret
      }),
      serverTs: tab.serverTs
    };

    return orgEnt;
  }

  projectTabToEnt(item: { tab: ProjectTab; hashSecret: string }): ProjectEnt {
    let { tab, hashSecret } = item;

    let projectSt: ProjectSt = {
      name: tab.name,
      zenApiKey: tab.zenApiKey,
      anthropicApiKey: tab.anthropicApiKey,
      openaiApiKey: tab.openaiApiKey,
      e2bApiKey: tab.e2bApiKey
    };

    let projectLt: ProjectLt = {
      defaultBranch: tab.defaultBranch,
      gitUrl: tab.gitUrl,
      publicKey: tab.publicKey,
      privateKey: tab.privateKey,
      publicKeyEncrypted: tab.publicKeyEncrypted,
      privateKeyEncrypted: tab.privateKeyEncrypted,
      passPhrase: tab.passPhrase
    };

    let projectEnt: ProjectEnt = {
      projectId: tab.projectId,
      orgId: tab.orgId,
      remoteType: tab.remoteType,
      ...this.getEntProps({
        dataSt: projectSt,
        dataLt: projectLt,
        isMetadata: false
      }),
      nameHash: this.hashService.makeHash({
        input: tab.name,
        hashSecret: hashSecret
      }),
      gitUrlHash: this.hashService.makeHash({
        input: tab.gitUrl,
        hashSecret: hashSecret
      }),
      serverTs: tab.serverTs
    };

    return projectEnt;
  }

  queryTabToEnt(item: { tab: QueryTab; hashSecret: string }): QueryEnt {
    let { tab, hashSecret } = item;

    let querySt: QuerySt = {
      sql: tab.sql,
      apiMethod: tab.apiMethod,
      apiUrl: tab.apiUrl,
      apiBody: tab.apiBody,
      lastErrorMessage: tab.lastErrorMessage
    };

    let queryLt: QueryLt = {
      data: tab.data
    };

    let queryEnt: QueryEnt = {
      projectId: tab.projectId,
      envId: tab.envId,
      connectionId: tab.connectionId,
      connectionType: tab.connectionType,
      queryId: tab.queryId,
      reportId: tab.reportId,
      reportStructId: tab.reportStructId,
      status: tab.status,
      lastRunBy: tab.lastRunBy,
      lastRunTs: tab.lastRunTs,
      lastCancelTs: tab.lastCancelTs,
      lastCompleteTs: tab.lastCompleteTs,
      lastCompleteDuration: tab.lastCompleteDuration,
      lastErrorTs: tab.lastErrorTs,
      queryJobId: tab.queryJobId,
      bigqueryQueryJobId: tab.bigqueryQueryJobId,
      bigqueryConsecutiveErrorsGetJob: tab.bigqueryConsecutiveErrorsGetJob,
      bigqueryConsecutiveErrorsGetResults:
        tab.bigqueryConsecutiveErrorsGetResults,
      ...this.getEntProps({
        dataSt: querySt,
        dataLt: queryLt,
        isMetadata: false
      }),
      apiUrlHash: this.hashService.makeHash({
        input: tab.apiUrl,
        hashSecret: hashSecret
      }),
      serverTs: tab.serverTs
    };

    return queryEnt;
  }

  reportTabToEnt(item: { tab: ReportTab; hashSecret: string }): ReportEnt {
    let { tab, hashSecret } = item;

    let reportSt: ReportSt = {
      filePath: tab.filePath,
      fields: tab.fields,
      accessRoles: tab.accessRoles,
      title: tab.title,
      chart: tab.chart
    };

    let reportLt: ReportLt = {
      rows: tab.rows
    };

    let reportEnt: ReportEnt = {
      reportFullId: this.hashService.makeReportFullId({
        structId: tab.structId,
        reportId: tab.reportId
      }),
      projectId: tab.projectId,
      structId: tab.structId,
      reportId: tab.reportId,
      creatorId: tab.creatorId,
      draft: tab.draft,
      draftCreatedTs: tab.draftCreatedTs,
      ...this.getEntProps({
        dataSt: reportSt,
        dataLt: reportLt,
        isMetadata: true
      }),
      serverTs: tab.serverTs
    };

    return reportEnt;
  }

  structTabToEnt(item: { tab: StructTab; hashSecret: string }): StructEnt {
    let { tab, hashSecret } = item;

    let structSt: StructSt = {};

    let structLt: StructLt = {
      errors: tab.errors,
      metrics: tab.metrics,
      presets: tab.presets,
      mproveConfig: tab.mproveConfig
    };

    let structEnt: StructEnt = {
      structId: tab.structId,
      projectId: tab.projectId,
      mproveVersion: tab.mproveVersion,
      ...this.getEntProps({
        dataSt: structSt,
        dataLt: structLt,
        isMetadata: true
      }),
      serverTs: tab.serverTs
    };

    return structEnt;
  }

  userTabToEnt(item: { tab: UserTab; hashSecret: string }): UserEnt {
    let { tab, hashSecret } = item;

    let userSt: UserSt = {};

    let userLt: UserLt = {
      email: tab.email,
      alias: tab.alias,
      passwordHash: tab.passwordHash,
      passwordSalt: tab.passwordSalt,
      firstName: tab.firstName,
      lastName: tab.lastName,
      emailVerificationToken: tab.emailVerificationToken,
      passwordResetToken: tab.passwordResetToken,
      passwordResetExpiresTs: tab.passwordResetExpiresTs,
      ui: tab.ui
    };

    let userEnt: UserEnt = {
      userId: tab.userId,
      isEmailVerified: tab.isEmailVerified,
      jwtMinIat: tab.jwtMinIat,
      ...this.getEntProps({
        dataSt: userSt,
        dataLt: userLt,
        isMetadata: false
      }),
      emailHash: this.hashService.makeHash({
        input: tab.email,
        hashSecret: hashSecret
      }),
      aliasHash: this.hashService.makeHash({
        input: tab.alias,
        hashSecret: hashSecret
      }),
      emailVerificationTokenHash: this.hashService.makeHash({
        input: tab.emailVerificationToken,
        hashSecret: hashSecret
      }),
      passwordResetTokenHash: this.hashService.makeHash({
        input: tab.passwordResetToken,
        hashSecret: hashSecret
      }),

      serverTs: tab.serverTs
    };

    return userEnt;
  }

  eventTabToEnt(item: { tab: EventTab; hashSecret: string }): EventEnt {
    let { tab } = item;

    let eventSt: EventSt = {
      universalEvent: tab.universalEvent
    };

    let eventLt: EventLt = {};

    let eventEnt: EventEnt = {
      eventId: tab.eventId,
      sessionId: tab.sessionId,
      eventIndex: tab.eventIndex,
      sender: tab.sender,
      ...this.getEntProps({
        dataSt: eventSt,
        dataLt: eventLt,
        isMetadata: false
      }),
      createdTs: tab.createdTs,
      serverTs: tab.serverTs
    };

    return eventEnt;
  }

  sessionTabToEnt(item: { tab: SessionTab; hashSecret: string }): SessionEnt {
    let { tab } = item;

    let sessionSt: SessionSt = {
      sandboxId: tab.sandboxId,
      sandboxBaseUrl: tab.sandboxBaseUrl,
      sandboxAgentToken: tab.sandboxAgentToken,
      sessionRecord: tab.sessionRecord,
      firstMessage: tab.firstMessage
    };

    let sessionLt: SessionLt = {};

    let sessionEnt: SessionEnt = {
      sessionId: tab.sessionId,
      userId: tab.userId,
      projectId: tab.projectId,
      model: tab.model,
      sandboxType: tab.sandboxType,
      agent: tab.agent,
      agentMode: tab.agentMode,
      permissionMode: tab.permissionMode,
      status: tab.status,
      ...this.getEntProps({
        dataSt: sessionSt,
        dataLt: sessionLt,
        isMetadata: false
      }),
      lastActivityTs: tab.lastActivityTs,
      runningStartTs: tab.runningStartTs,
      expiresAt: tab.expiresAt,
      createdTs: tab.createdTs,
      serverTs: tab.serverTs
    };

    return sessionEnt;
  }
}
