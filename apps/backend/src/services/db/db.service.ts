import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { Options } from 'async-retry';
import type { SQLWrapper } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { PackerOutput } from '#backend/drizzle/postgres/drizzle-packer';
import type {
  AvatarTab,
  BranchTab,
  BridgeTab,
  CachedColumnTab,
  CachedPartTab,
  ChartTab,
  ConnectionTab,
  DashboardTab,
  DconfigTab,
  EnvTab,
  GivenTab,
  KitTab,
  MconfigTab,
  MemberTab,
  ModelTab,
  NoteTab,
  OcEventTab,
  OcMessageTab,
  OcPartTab,
  OcSessionTab,
  OrgTab,
  ProjectTab,
  ProviderTab,
  QueryTab,
  ReportTab,
  RoleTab,
  SessionTab,
  StructTab,
  UconfigTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import type { AvatarEnt } from '#backend/drizzle/postgres/schema/avatars';
import type { BranchEnt } from '#backend/drizzle/postgres/schema/branches';
import type { BridgeEnt } from '#backend/drizzle/postgres/schema/bridges';
import type { CachedColumnsEnt } from '#backend/drizzle/postgres/schema/cached-columns';
import type { CachedPartsEnt } from '#backend/drizzle/postgres/schema/cached-parts';
import type { ChartEnt } from '#backend/drizzle/postgres/schema/charts';
import type { ConnectionEnt } from '#backend/drizzle/postgres/schema/connections';
import type { DashboardEnt } from '#backend/drizzle/postgres/schema/dashboards';
import type { DconfigEnt } from '#backend/drizzle/postgres/schema/dconfigs';
import type { EnvEnt } from '#backend/drizzle/postgres/schema/envs';
import type { GivenEnt } from '#backend/drizzle/postgres/schema/givens';
import type { KitEnt } from '#backend/drizzle/postgres/schema/kits';
import type { MconfigEnt } from '#backend/drizzle/postgres/schema/mconfigs';
import type { MemberEnt } from '#backend/drizzle/postgres/schema/members';
import type { ModelEnt } from '#backend/drizzle/postgres/schema/models';
import type { NoteEnt } from '#backend/drizzle/postgres/schema/notes';
import type { OcEventEnt } from '#backend/drizzle/postgres/schema/oc-events';
import type { OcMessageEnt } from '#backend/drizzle/postgres/schema/oc-messages';
import type { OcPartEnt } from '#backend/drizzle/postgres/schema/oc-parts';
import type { OcSessionEnt } from '#backend/drizzle/postgres/schema/oc-sessions';
import type { OrgEnt } from '#backend/drizzle/postgres/schema/orgs';
import type { ProjectEnt } from '#backend/drizzle/postgres/schema/projects';
import type { ProviderEnt } from '#backend/drizzle/postgres/schema/providers';
import type { QueryEnt } from '#backend/drizzle/postgres/schema/queries';
import type { ReportEnt } from '#backend/drizzle/postgres/schema/reports';
import type { RoleEnt } from '#backend/drizzle/postgres/schema/roles';
import type { SessionEnt } from '#backend/drizzle/postgres/schema/sessions';
import type { StructEnt } from '#backend/drizzle/postgres/schema/structs';
import type { UconfigEnt } from '#backend/drizzle/postgres/schema/uconfigs';
import type { UserEnt } from '#backend/drizzle/postgres/schema/users';
import { retryTransaction } from '#backend/functions/retry-transaction/retry-transaction';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import type { DbTabsPack } from '#backend/interfaces/db-tabs-pack';
import {
  createDbReader,
  type DbReader
} from '#backend/services/db/create-db-reader/create-db-reader';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import type { BackendAvatarDoesNotExistError } from '#common/types/backend/errors/backend-avatar-does-not-exist-error';
import type { BackendBranchDoesNotExistError } from '#common/types/backend/errors/backend-branch-does-not-exist-error';
import type { BackendBridgeBranchEnvDoesNotExistError } from '#common/types/backend/errors/backend-bridge-branch-env-does-not-exist-error';
import type { BackendCachedColumnDoesNotExistError } from '#common/types/backend/errors/backend-cached-column-does-not-exist-error';
import type { BackendCachedPartDoesNotExistError } from '#common/types/backend/errors/backend-cached-part-does-not-exist-error';
import type { BackendChartDoesNotExistError } from '#common/types/backend/errors/backend-chart-does-not-exist-error';
import type { BackendConnectionDoesNotExistError } from '#common/types/backend/errors/backend-connection-does-not-exist-error';
import type { BackendDashboardDoesNotExistError } from '#common/types/backend/errors/backend-dashboard-does-not-exist-error';
import type { BackendDconfigDoesNotExistError } from '#common/types/backend/errors/backend-dconfig-does-not-exist-error';
import type { BackendEnvDoesNotExistError } from '#common/types/backend/errors/backend-env-does-not-exist-error';
import type { BackendGivenDoesNotExistError } from '#common/types/backend/errors/backend-given-does-not-exist-error';
import type { BackendKitDoesNotExistError } from '#common/types/backend/errors/backend-kit-does-not-exist-error';
import type { BackendMconfigDoesNotExistError } from '#common/types/backend/errors/backend-mconfig-does-not-exist-error';
import type { BackendMemberDoesNotExistError } from '#common/types/backend/errors/backend-member-does-not-exist-error';
import type { BackendModelDoesNotExistError } from '#common/types/backend/errors/backend-model-does-not-exist-error';
import type { BackendNoteDoesNotExistError } from '#common/types/backend/errors/backend-note-does-not-exist-error';
import type { BackendOcEventDoesNotExistError } from '#common/types/backend/errors/backend-oc-event-does-not-exist-error';
import type { BackendOcMessageDoesNotExistError } from '#common/types/backend/errors/backend-oc-message-does-not-exist-error';
import type { BackendOcPartDoesNotExistError } from '#common/types/backend/errors/backend-oc-part-does-not-exist-error';
import type { BackendOcSessionDoesNotExistError } from '#common/types/backend/errors/backend-oc-session-does-not-exist-error';
import type { BackendOrgDoesNotExistError } from '#common/types/backend/errors/backend-org-does-not-exist-error';
import type { BackendProjectDoesNotExistError } from '#common/types/backend/errors/backend-project-does-not-exist-error';
import type { BackendProviderDoesNotExistError } from '#common/types/backend/errors/backend-provider-does-not-exist-error';
import type { BackendQueryDoesNotExistError } from '#common/types/backend/errors/backend-query-does-not-exist-error';
import type { BackendReportNotFoundError } from '#common/types/backend/errors/backend-report-not-found-error';
import type { BackendRoleDoesNotExistError } from '#common/types/backend/errors/backend-role-does-not-exist-error';
import type { BackendSessionNotFoundError } from '#common/types/backend/errors/backend-session-not-found-error';
import type { BackendStructDoesNotExistError } from '#common/types/backend/errors/backend-struct-does-not-exist-error';
import type { BackendUconfigDoesNotExistError } from '#common/types/backend/errors/backend-uconfig-does-not-exist-error';
import type { BackendUserDoesNotExistError } from '#common/types/backend/errors/backend-user-does-not-exist-error';
import type { AvatarEntToTabError } from '#common/types/backend/function-errors/avatar-ent-to-tab-error';
import type { BranchEntToTabError } from '#common/types/backend/function-errors/branch-ent-to-tab-error';
import type { BridgeEntToTabError } from '#common/types/backend/function-errors/bridge-ent-to-tab-error';
import type { CachedColumnEntToTabError } from '#common/types/backend/function-errors/cached-column-ent-to-tab-error';
import type { CachedPartEntToTabError } from '#common/types/backend/function-errors/cached-part-ent-to-tab-error';
import type { ChartEntToTabError } from '#common/types/backend/function-errors/chart-ent-to-tab-error';
import type { ConnectionEntToTabError } from '#common/types/backend/function-errors/connection-ent-to-tab-error';
import type { DashboardEntToTabError } from '#common/types/backend/function-errors/dashboard-ent-to-tab-error';
import type { DconfigEntToTabError } from '#common/types/backend/function-errors/dconfig-ent-to-tab-error';
import type { EnvEntToTabError } from '#common/types/backend/function-errors/env-ent-to-tab-error';
import type { GivenEntToTabError } from '#common/types/backend/function-errors/given-ent-to-tab-error';
import type { KitEntToTabError } from '#common/types/backend/function-errors/kit-ent-to-tab-error';
import type { MconfigEntToTabError } from '#common/types/backend/function-errors/mconfig-ent-to-tab-error';
import type { MemberEntToTabError } from '#common/types/backend/function-errors/member-ent-to-tab-error';
import type { ModelEntToTabError } from '#common/types/backend/function-errors/model-ent-to-tab-error';
import type { NoteEntToTabError } from '#common/types/backend/function-errors/note-ent-to-tab-error';
import type { OcEventEntToTabError } from '#common/types/backend/function-errors/oc-event-ent-to-tab-error';
import type { OcMessageEntToTabError } from '#common/types/backend/function-errors/oc-message-ent-to-tab-error';
import type { OcPartEntToTabError } from '#common/types/backend/function-errors/oc-part-ent-to-tab-error';
import type { OcSessionEntToTabError } from '#common/types/backend/function-errors/oc-session-ent-to-tab-error';
import type { OrgEntToTabError } from '#common/types/backend/function-errors/org-ent-to-tab-error';
import type { ProjectEntToTabError } from '#common/types/backend/function-errors/project-ent-to-tab-error';
import type { ProviderEntToTabError } from '#common/types/backend/function-errors/provider-ent-to-tab-error';
import type { QueryEntToTabError } from '#common/types/backend/function-errors/query-ent-to-tab-error';
import type { ReportEntToTabError } from '#common/types/backend/function-errors/report-ent-to-tab-error';
import type { RoleEntToTabError } from '#common/types/backend/function-errors/role-ent-to-tab-error';
import type { SessionEntToTabError } from '#common/types/backend/function-errors/session-ent-to-tab-error';
import type { StructEntToTabError } from '#common/types/backend/function-errors/struct-ent-to-tab-error';
import type { UconfigEntToTabError } from '#common/types/backend/function-errors/uconfig-ent-to-tab-error';
import type { UserEntToTabError } from '#common/types/backend/function-errors/user-ent-to-tab-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';

@Injectable()
export class DbService implements Db {
  get drizzle(): Db['drizzle'] {
    let drizzle: Db['drizzle'] = this.db.drizzle;

    return drizzle;
  }

  get packer(): Db['packer'] {
    let packer: Db['packer'] = this.db.packer;

    return packer;
  }

  get pool(): Db['pool'] {
    let pool: Db['pool'] = this.db.pool;

    return pool;
  }

  readonly avatars: DbReader<
    'avatarsTable',
    AvatarTab,
    AvatarEntToTabError,
    BackendAvatarDoesNotExistError
  >;

  readonly users: DbReader<
    'usersTable',
    UserTab,
    UserEntToTabError,
    BackendUserDoesNotExistError
  >;

  readonly branches: DbReader<
    'branchesTable',
    BranchTab,
    BranchEntToTabError,
    BackendBranchDoesNotExistError
  >;

  readonly bridges: DbReader<
    'bridgesTable',
    BridgeTab,
    BridgeEntToTabError,
    BackendBridgeBranchEnvDoesNotExistError
  >;

  readonly cachedColumns: DbReader<
    'cachedColumnsTable',
    CachedColumnTab,
    CachedColumnEntToTabError,
    BackendCachedColumnDoesNotExistError
  >;

  readonly cachedParts: DbReader<
    'cachedPartsTable',
    CachedPartTab,
    CachedPartEntToTabError,
    BackendCachedPartDoesNotExistError
  >;

  readonly charts: DbReader<
    'chartsTable',
    ChartTab,
    ChartEntToTabError,
    BackendChartDoesNotExistError
  >;

  readonly connections: DbReader<
    'connectionsTable',
    ConnectionTab,
    ConnectionEntToTabError,
    BackendConnectionDoesNotExistError
  >;

  readonly dashboards: DbReader<
    'dashboardsTable',
    DashboardTab,
    DashboardEntToTabError,
    BackendDashboardDoesNotExistError
  >;

  readonly dconfigs: DbReader<
    'dconfigsTable',
    DconfigTab,
    DconfigEntToTabError,
    BackendDconfigDoesNotExistError
  >;

  readonly envs: DbReader<
    'envsTable',
    EnvTab,
    EnvEntToTabError,
    BackendEnvDoesNotExistError
  >;

  readonly givens: DbReader<
    'givensTable',
    GivenTab,
    GivenEntToTabError,
    BackendGivenDoesNotExistError
  >;

  readonly kits: DbReader<
    'kitsTable',
    KitTab,
    KitEntToTabError,
    BackendKitDoesNotExistError
  >;

  readonly mconfigs: DbReader<
    'mconfigsTable',
    MconfigTab,
    MconfigEntToTabError,
    BackendMconfigDoesNotExistError
  >;

  readonly members: DbReader<
    'membersTable',
    MemberTab,
    MemberEntToTabError,
    BackendMemberDoesNotExistError
  >;

  readonly models: DbReader<
    'modelsTable',
    ModelTab,
    ModelEntToTabError,
    BackendModelDoesNotExistError
  >;

  readonly notes: DbReader<
    'notesTable',
    NoteTab,
    NoteEntToTabError,
    BackendNoteDoesNotExistError
  >;

  readonly ocEvents: DbReader<
    'ocEventsTable',
    OcEventTab,
    OcEventEntToTabError,
    BackendOcEventDoesNotExistError
  >;

  readonly ocMessages: DbReader<
    'ocMessagesTable',
    OcMessageTab,
    OcMessageEntToTabError,
    BackendOcMessageDoesNotExistError
  >;

  readonly ocParts: DbReader<
    'ocPartsTable',
    OcPartTab,
    OcPartEntToTabError,
    BackendOcPartDoesNotExistError
  >;

  readonly ocSessions: DbReader<
    'ocSessionsTable',
    OcSessionTab,
    OcSessionEntToTabError,
    BackendOcSessionDoesNotExistError
  >;

  readonly orgs: DbReader<
    'orgsTable',
    OrgTab,
    OrgEntToTabError,
    BackendOrgDoesNotExistError
  >;

  readonly projects: DbReader<
    'projectsTable',
    ProjectTab,
    ProjectEntToTabError,
    BackendProjectDoesNotExistError
  >;

  readonly providers: DbReader<
    'providersTable',
    ProviderTab,
    ProviderEntToTabError,
    BackendProviderDoesNotExistError
  >;

  readonly queries: DbReader<
    'queriesTable',
    QueryTab,
    QueryEntToTabError,
    BackendQueryDoesNotExistError
  >;

  readonly reports: DbReader<
    'reportsTable',
    ReportTab,
    ReportEntToTabError,
    BackendReportNotFoundError
  >;

  readonly roles: DbReader<
    'rolesTable',
    RoleTab,
    RoleEntToTabError,
    BackendRoleDoesNotExistError
  >;

  readonly sessions: DbReader<
    'sessionsTable',
    SessionTab,
    SessionEntToTabError,
    BackendSessionNotFoundError
  >;

  readonly structs: DbReader<
    'structsTable',
    StructTab,
    StructEntToTabError,
    BackendStructDoesNotExistError
  >;

  readonly uconfigs: DbReader<
    'uconfigsTable',
    UconfigTab,
    UconfigEntToTabError,
    BackendUconfigDoesNotExistError
  >;

  constructor(
    @Inject(DRIZZLE) private db: Db,
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
  ) {
    this.branches = createDbReader<
      'branchesTable',
      BranchEnt,
      BranchTab,
      BranchEntToTabError,
      BackendBranchDoesNotExistError
    >({
      defaultError: { code: 'BACKEND_BRANCH_DOES_NOT_EXIST' },
      findFirst: item => this.db.drizzle.query.branchesTable.findFirst(item),
      findMany: item => this.db.drizzle.query.branchesTable.findMany(item),
      convert: branchEnt =>
        this.tabService.branchEntToTab({ branchEnt: branchEnt })
    });

    this.bridges = createDbReader<
      'bridgesTable',
      BridgeEnt,
      BridgeTab,
      BridgeEntToTabError,
      BackendBridgeBranchEnvDoesNotExistError
    >({
      defaultError: { code: 'BACKEND_BRIDGE_BRANCH_ENV_DOES_NOT_EXIST' },
      findFirst: item => this.db.drizzle.query.bridgesTable.findFirst(item),
      findMany: item => this.db.drizzle.query.bridgesTable.findMany(item),
      convert: bridgeEnt =>
        this.tabService.bridgeEntToTab({ bridgeEnt: bridgeEnt })
    });

    this.cachedColumns = createDbReader<
      'cachedColumnsTable',
      CachedColumnsEnt,
      CachedColumnTab,
      CachedColumnEntToTabError,
      BackendCachedColumnDoesNotExistError
    >({
      defaultError: { code: 'BACKEND_CACHED_COLUMN_DOES_NOT_EXIST' },
      findFirst: item =>
        this.db.drizzle.query.cachedColumnsTable.findFirst(item),
      findMany: item => this.db.drizzle.query.cachedColumnsTable.findMany(item),
      convert: cachedColumnEnt =>
        this.tabService.cachedColumnEntToTab({
          cachedColumnEnt: cachedColumnEnt
        })
    });

    this.cachedParts = createDbReader<
      'cachedPartsTable',
      CachedPartsEnt,
      CachedPartTab,
      CachedPartEntToTabError,
      BackendCachedPartDoesNotExistError
    >({
      defaultError: { code: 'BACKEND_CACHED_PART_DOES_NOT_EXIST' },
      findFirst: item => this.db.drizzle.query.cachedPartsTable.findFirst(item),
      findMany: item => this.db.drizzle.query.cachedPartsTable.findMany(item),
      convert: cachedPartEnt =>
        this.tabService.cachedPartEntToTab({ cachedPartEnt: cachedPartEnt })
    });

    this.charts = createDbReader<
      'chartsTable',
      ChartEnt,
      ChartTab,
      ChartEntToTabError,
      BackendChartDoesNotExistError
    >({
      defaultError: { code: 'BACKEND_CHART_DOES_NOT_EXIST' },
      findExists: item =>
        this.db.drizzle.query.chartsTable.findFirst({
          ...item,
          columns: { chartId: true }
        }),
      findFirst: item => this.db.drizzle.query.chartsTable.findFirst(item),
      findMany: item => this.db.drizzle.query.chartsTable.findMany(item),
      convert: chartEnt => this.tabService.chartEntToTab({ chartEnt: chartEnt })
    });

    this.connections = createDbReader<
      'connectionsTable',
      ConnectionEnt,
      ConnectionTab,
      ConnectionEntToTabError,
      BackendConnectionDoesNotExistError
    >({
      defaultError: { code: 'BACKEND_CONNECTION_DOES_NOT_EXIST' },
      findFirst: item => this.db.drizzle.query.connectionsTable.findFirst(item),
      findMany: item => this.db.drizzle.query.connectionsTable.findMany(item),
      convert: connectionEnt =>
        this.tabService.connectionEntToTab({ connectionEnt: connectionEnt })
    });

    this.dashboards = createDbReader<
      'dashboardsTable',
      DashboardEnt,
      DashboardTab,
      DashboardEntToTabError,
      BackendDashboardDoesNotExistError
    >({
      defaultError: { code: 'BACKEND_DASHBOARD_DOES_NOT_EXIST' },
      findExists: item =>
        this.db.drizzle.query.dashboardsTable.findFirst({
          ...item,
          columns: { dashboardId: true }
        }),
      findFirst: item => this.db.drizzle.query.dashboardsTable.findFirst(item),
      findMany: item => this.db.drizzle.query.dashboardsTable.findMany(item),
      convert: dashboardEnt =>
        this.tabService.dashboardEntToTab({ dashboardEnt: dashboardEnt })
    });

    this.dconfigs = createDbReader<
      'dconfigsTable',
      DconfigEnt,
      DconfigTab,
      DconfigEntToTabError,
      BackendDconfigDoesNotExistError
    >({
      defaultError: { code: 'BACKEND_DCONFIG_DOES_NOT_EXIST' },
      findFirst: item => this.db.drizzle.query.dconfigsTable.findFirst(item),
      findMany: item => this.db.drizzle.query.dconfigsTable.findMany(item),
      convert: dconfigEnt =>
        this.tabService.dconfigEntToTab({ dconfigEnt: dconfigEnt })
    });

    this.envs = createDbReader<
      'envsTable',
      EnvEnt,
      EnvTab,
      EnvEntToTabError,
      BackendEnvDoesNotExistError
    >({
      defaultError: { code: 'BACKEND_ENV_DOES_NOT_EXIST' },
      findFirst: item => this.db.drizzle.query.envsTable.findFirst(item),
      findMany: item => this.db.drizzle.query.envsTable.findMany(item),
      convert: envEnt => this.tabService.envEntToTab({ envEnt: envEnt })
    });

    this.givens = createDbReader<
      'givensTable',
      GivenEnt,
      GivenTab,
      GivenEntToTabError,
      BackendGivenDoesNotExistError
    >({
      defaultError: { code: 'BACKEND_GIVEN_DOES_NOT_EXIST' },
      findFirst: item => this.db.drizzle.query.givensTable.findFirst(item),
      findMany: item => this.db.drizzle.query.givensTable.findMany(item),
      convert: givenEnt => this.tabService.givenEntToTab({ givenEnt: givenEnt })
    });

    this.kits = createDbReader<
      'kitsTable',
      KitEnt,
      KitTab,
      KitEntToTabError,
      BackendKitDoesNotExistError
    >({
      defaultError: { code: 'BACKEND_KIT_DOES_NOT_EXIST' },
      findFirst: item => this.db.drizzle.query.kitsTable.findFirst(item),
      findMany: item => this.db.drizzle.query.kitsTable.findMany(item),
      convert: kitEnt => this.tabService.kitEntToTab({ kitEnt: kitEnt })
    });

    this.mconfigs = createDbReader<
      'mconfigsTable',
      MconfigEnt,
      MconfigTab,
      MconfigEntToTabError,
      BackendMconfigDoesNotExistError
    >({
      defaultError: { code: 'BACKEND_MCONFIG_DOES_NOT_EXIST' },
      findFirst: item => this.db.drizzle.query.mconfigsTable.findFirst(item),
      findMany: item => this.db.drizzle.query.mconfigsTable.findMany(item),
      convert: mconfigEnt =>
        this.tabService.mconfigEntToTab({ mconfigEnt: mconfigEnt })
    });

    this.members = createDbReader<
      'membersTable',
      MemberEnt,
      MemberTab,
      MemberEntToTabError,
      BackendMemberDoesNotExistError
    >({
      defaultError: { code: 'BACKEND_MEMBER_DOES_NOT_EXIST' },
      findFirst: item => this.db.drizzle.query.membersTable.findFirst(item),
      findMany: item => this.db.drizzle.query.membersTable.findMany(item),
      convert: memberEnt =>
        this.tabService.memberEntToTab({ memberEnt: memberEnt })
    });

    this.models = createDbReader<
      'modelsTable',
      ModelEnt,
      ModelTab,
      ModelEntToTabError,
      BackendModelDoesNotExistError
    >({
      defaultError: { code: 'BACKEND_MODEL_DOES_NOT_EXIST' },
      findExists: item =>
        this.db.drizzle.query.modelsTable.findFirst({
          ...item,
          columns: { modelId: true }
        }),
      findFirst: item => this.db.drizzle.query.modelsTable.findFirst(item),
      findMany: item => this.db.drizzle.query.modelsTable.findMany(item),
      convert: modelEnt => this.tabService.modelEntToTab({ modelEnt: modelEnt })
    });

    this.notes = createDbReader<
      'notesTable',
      NoteEnt,
      NoteTab,
      NoteEntToTabError,
      BackendNoteDoesNotExistError
    >({
      defaultError: { code: 'BACKEND_NOTE_DOES_NOT_EXIST' },
      findFirst: item => this.db.drizzle.query.notesTable.findFirst(item),
      findMany: item => this.db.drizzle.query.notesTable.findMany(item),
      convert: noteEnt => this.tabService.noteEntToTab({ noteEnt: noteEnt })
    });

    this.ocEvents = createDbReader<
      'ocEventsTable',
      OcEventEnt,
      OcEventTab,
      OcEventEntToTabError,
      BackendOcEventDoesNotExistError
    >({
      defaultError: { code: 'BACKEND_OC_EVENT_DOES_NOT_EXIST' },
      findFirst: item => this.db.drizzle.query.ocEventsTable.findFirst(item),
      findMany: item => this.db.drizzle.query.ocEventsTable.findMany(item),
      convert: eventEnt =>
        this.tabService.ocEventEntToTab({ eventEnt: eventEnt })
    });

    this.ocMessages = createDbReader<
      'ocMessagesTable',
      OcMessageEnt,
      OcMessageTab,
      OcMessageEntToTabError,
      BackendOcMessageDoesNotExistError
    >({
      defaultError: { code: 'BACKEND_OC_MESSAGE_DOES_NOT_EXIST' },
      findFirst: item => this.db.drizzle.query.ocMessagesTable.findFirst(item),
      findMany: item => this.db.drizzle.query.ocMessagesTable.findMany(item),
      convert: messageEnt =>
        this.tabService.ocMessageEntToTab({ messageEnt: messageEnt })
    });

    this.ocParts = createDbReader<
      'ocPartsTable',
      OcPartEnt,
      OcPartTab,
      OcPartEntToTabError,
      BackendOcPartDoesNotExistError
    >({
      defaultError: { code: 'BACKEND_OC_PART_DOES_NOT_EXIST' },
      findFirst: item => this.db.drizzle.query.ocPartsTable.findFirst(item),
      findMany: item => this.db.drizzle.query.ocPartsTable.findMany(item),
      convert: partEnt => this.tabService.ocPartEntToTab({ partEnt: partEnt })
    });

    this.ocSessions = createDbReader<
      'ocSessionsTable',
      OcSessionEnt,
      OcSessionTab,
      OcSessionEntToTabError,
      BackendOcSessionDoesNotExistError
    >({
      defaultError: { code: 'BACKEND_OC_SESSION_DOES_NOT_EXIST' },
      findFirst: item => this.db.drizzle.query.ocSessionsTable.findFirst(item),
      findMany: item => this.db.drizzle.query.ocSessionsTable.findMany(item),
      convert: ocSessionEnt =>
        this.tabService.ocSessionEntToTab({ ocSessionEnt: ocSessionEnt })
    });

    this.orgs = createDbReader<
      'orgsTable',
      OrgEnt,
      OrgTab,
      OrgEntToTabError,
      BackendOrgDoesNotExistError
    >({
      defaultError: { code: 'BACKEND_ORG_DOES_NOT_EXIST' },
      findFirst: item => this.db.drizzle.query.orgsTable.findFirst(item),
      findMany: item => this.db.drizzle.query.orgsTable.findMany(item),
      convert: orgEnt => this.tabService.orgEntToTab({ orgEnt: orgEnt })
    });

    this.projects = createDbReader<
      'projectsTable',
      ProjectEnt,
      ProjectTab,
      ProjectEntToTabError,
      BackendProjectDoesNotExistError
    >({
      defaultError: { code: 'BACKEND_PROJECT_DOES_NOT_EXIST' },
      findFirst: item => this.db.drizzle.query.projectsTable.findFirst(item),
      findMany: item => this.db.drizzle.query.projectsTable.findMany(item),
      convert: projectEnt =>
        this.tabService.projectEntToTab({ projectEnt: projectEnt })
    });

    this.providers = createDbReader<
      'providersTable',
      ProviderEnt,
      ProviderTab,
      ProviderEntToTabError,
      BackendProviderDoesNotExistError
    >({
      defaultError: { code: 'BACKEND_PROVIDER_DOES_NOT_EXIST' },
      findFirst: item => this.db.drizzle.query.providersTable.findFirst(item),
      findMany: item => this.db.drizzle.query.providersTable.findMany(item),
      convert: providerEnt =>
        this.tabService.providerEntToTab({ providerEnt: providerEnt })
    });

    this.queries = createDbReader<
      'queriesTable',
      QueryEnt,
      QueryTab,
      QueryEntToTabError,
      BackendQueryDoesNotExistError
    >({
      defaultError: { code: 'BACKEND_QUERY_DOES_NOT_EXIST' },
      findFirst: item => this.db.drizzle.query.queriesTable.findFirst(item),
      findMany: item => this.db.drizzle.query.queriesTable.findMany(item),
      convert: queryEnt => this.tabService.queryEntToTab({ queryEnt: queryEnt })
    });

    this.reports = createDbReader<
      'reportsTable',
      ReportEnt,
      ReportTab,
      ReportEntToTabError,
      BackendReportNotFoundError
    >({
      defaultError: { code: 'BACKEND_REPORT_NOT_FOUND' },
      findExists: item =>
        this.db.drizzle.query.reportsTable.findFirst({
          ...item,
          columns: { reportId: true }
        }),
      findFirst: item => this.db.drizzle.query.reportsTable.findFirst(item),
      findMany: item => this.db.drizzle.query.reportsTable.findMany(item),
      convert: reportEnt =>
        this.tabService.reportEntToTab({ reportEnt: reportEnt })
    });

    this.roles = createDbReader<
      'rolesTable',
      RoleEnt,
      RoleTab,
      RoleEntToTabError,
      BackendRoleDoesNotExistError
    >({
      defaultError: { code: 'BACKEND_ROLE_DOES_NOT_EXIST' },
      findFirst: item => this.db.drizzle.query.rolesTable.findFirst(item),
      findMany: item => this.db.drizzle.query.rolesTable.findMany(item),
      convert: roleEnt => this.tabService.roleEntToTab({ roleEnt: roleEnt })
    });

    this.sessions = createDbReader<
      'sessionsTable',
      SessionEnt,
      SessionTab,
      SessionEntToTabError,
      BackendSessionNotFoundError
    >({
      defaultError: { code: 'BACKEND_SESSION_NOT_FOUND' },
      findExists: item =>
        this.db.drizzle.query.sessionsTable.findFirst({
          ...item,
          columns: { sessionId: true }
        }),
      findFirst: item => this.db.drizzle.query.sessionsTable.findFirst(item),
      findMany: item => this.db.drizzle.query.sessionsTable.findMany(item),
      convert: sessionEnt =>
        this.tabService.sessionEntToTab({ sessionEnt: sessionEnt })
    });

    this.structs = createDbReader<
      'structsTable',
      StructEnt,
      StructTab,
      StructEntToTabError,
      BackendStructDoesNotExistError
    >({
      defaultError: { code: 'BACKEND_STRUCT_DOES_NOT_EXIST' },
      findFirst: item => this.db.drizzle.query.structsTable.findFirst(item),
      findMany: item => this.db.drizzle.query.structsTable.findMany(item),
      convert: structEnt =>
        this.tabService.structEntToTab({ structEnt: structEnt })
    });

    this.uconfigs = createDbReader<
      'uconfigsTable',
      UconfigEnt,
      UconfigTab,
      UconfigEntToTabError,
      BackendUconfigDoesNotExistError
    >({
      defaultError: { code: 'BACKEND_UCONFIG_DOES_NOT_EXIST' },
      findFirst: item => this.db.drizzle.query.uconfigsTable.findFirst(item),
      findMany: item => this.db.drizzle.query.uconfigsTable.findMany(item),
      convert: uconfigEnt =>
        this.tabService.uconfigEntToTab({ uconfigEnt: uconfigEnt })
    });

    this.avatars = createDbReader<
      'avatarsTable',
      AvatarEnt,
      AvatarTab,
      AvatarEntToTabError,
      BackendAvatarDoesNotExistError
    >({
      defaultError: { code: 'BACKEND_AVATAR_DOES_NOT_EXIST' },
      findFirst: item => this.db.drizzle.query.avatarsTable.findFirst(item),
      findMany: item => this.db.drizzle.query.avatarsTable.findMany(item),
      convert: avatarEnt =>
        this.tabService.avatarEntToTab({ avatarEnt: avatarEnt })
    });

    this.users = createDbReader<
      'usersTable',
      UserEnt,
      UserTab,
      UserEntToTabError,
      BackendUserDoesNotExistError
    >({
      defaultError: { code: 'BACKEND_USER_DOES_NOT_EXIST' },
      findFirst: item => this.db.drizzle.query.usersTable.findFirst(item),
      findMany: item => this.db.drizzle.query.usersTable.findMany(item),
      convert: userEnt => this.tabService.userEntToTab({ userEnt: userEnt })
    });
  }

  async writeUnwrap(item: {
    insert?: DbTabsPack;
    update?: DbTabsPack;
    insertOrUpdate?: DbTabsPack;
    insertOrDoNothing?: DbTabsPack;
    rawQueries?: SQLWrapper[];
    serverTs?: number;
    retryOptions?: Options;
  }): Promise<PackerOutput> {
    let {
      insert,
      update,
      insertOrUpdate,
      insertOrDoNothing,
      rawQueries,
      serverTs,
      retryOptions
    } = item;

    let result: Result.Result<PackerOutput, WriteError> = await this.write({
      insert: insert,
      update: update,
      insertOrUpdate: insertOrUpdate,
      insertOrDoNothing: insertOrDoNothing,
      rawQueries: rawQueries,
      serverTs: serverTs,
      retryOptions: retryOptions
    });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let output: PackerOutput = result.value;

    return output;
  }

  async write(item: {
    insert?: DbTabsPack;
    update?: DbTabsPack;
    insertOrUpdate?: DbTabsPack;
    insertOrDoNothing?: DbTabsPack;
    rawQueries?: SQLWrapper[];
    serverTs?: number;
    retryOptions?: Options;
  }): Result.ResultAsync<PackerOutput, WriteError> {
    let {
      insert,
      update,
      insertOrUpdate,
      insertOrDoNothing,
      rawQueries,
      serverTs,
      retryOptions
    } = item;

    return retryTransaction({
      db: this.db,
      options: retryOptions ?? getRetryOption(this.cs, this.logger),
      action: ({ tx }) =>
        this.db.packer.write({
          tx: tx,
          insert: insert,
          update: update,
          insertOrUpdate: insertOrUpdate,
          insertOrDoNothing: insertOrDoNothing,
          rawQueries: rawQueries,
          serverTs: serverTs
        })
    });
  }
}
