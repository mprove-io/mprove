import type { schemaPostgres } from '#backend/drizzle/postgres/schema/_schema-postgres';
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
  ModelFieldLeafTab,
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
import type { MemberTabToEntError } from '#common/types/backend/function-errors/member-tab-to-ent-error';
import type { ModelEntToTabError } from '#common/types/backend/function-errors/model-ent-to-tab-error';
import type { NoteEntToTabError } from '#common/types/backend/function-errors/note-ent-to-tab-error';
import type { OcEventEntToTabError } from '#common/types/backend/function-errors/oc-event-ent-to-tab-error';
import type { OcMessageEntToTabError } from '#common/types/backend/function-errors/oc-message-ent-to-tab-error';
import type { OcPartEntToTabError } from '#common/types/backend/function-errors/oc-part-ent-to-tab-error';
import type { OcSessionEntToTabError } from '#common/types/backend/function-errors/oc-session-ent-to-tab-error';
import type { OrgEntToTabError } from '#common/types/backend/function-errors/org-ent-to-tab-error';
import type { OrgTabToEntError } from '#common/types/backend/function-errors/org-tab-to-ent-error';
import type { ProjectEntToTabError } from '#common/types/backend/function-errors/project-ent-to-tab-error';
import type { ProjectTabToEntError } from '#common/types/backend/function-errors/project-tab-to-ent-error';
import type { ProviderEntToTabError } from '#common/types/backend/function-errors/provider-ent-to-tab-error';
import type { QueryEntToTabError } from '#common/types/backend/function-errors/query-ent-to-tab-error';
import type { QueryTabToEntError } from '#common/types/backend/function-errors/query-tab-to-ent-error';
import type { ReportEntToTabError } from '#common/types/backend/function-errors/report-ent-to-tab-error';
import type { RoleEntToTabError } from '#common/types/backend/function-errors/role-ent-to-tab-error';
import type { SessionEntToTabError } from '#common/types/backend/function-errors/session-ent-to-tab-error';
import type { StructEntToTabError } from '#common/types/backend/function-errors/struct-ent-to-tab-error';
import type { UconfigEntToTabError } from '#common/types/backend/function-errors/uconfig-ent-to-tab-error';
import type { UserEntToTabError } from '#common/types/backend/function-errors/user-ent-to-tab-error';
import type { UserTabToEntError } from '#common/types/backend/function-errors/user-tab-to-ent-error';

export type DbTableDefinitionMap = {
  avatars: {
    tab: AvatarTab;
    writeError: never;
    readError: AvatarEntToTabError;
    notFoundError: BackendAvatarDoesNotExistError;
  };
  branches: {
    tab: BranchTab;
    writeError: never;
    readError: BranchEntToTabError;
    notFoundError: BackendBranchDoesNotExistError;
  };
  bridges: {
    tab: BridgeTab;
    writeError: never;
    readError: BridgeEntToTabError;
    notFoundError: BackendBridgeBranchEnvDoesNotExistError;
  };
  cachedColumns: {
    tab: CachedColumnTab;
    writeError: never;
    readError: CachedColumnEntToTabError;
    notFoundError: BackendCachedColumnDoesNotExistError;
  };
  cachedParts: {
    tab: CachedPartTab;
    writeError: never;
    readError: CachedPartEntToTabError;
    notFoundError: BackendCachedPartDoesNotExistError;
  };
  charts: {
    tab: ChartTab;
    writeError: never;
    readError: ChartEntToTabError;
    notFoundError: BackendChartDoesNotExistError;
  };
  connections: {
    tab: ConnectionTab;
    writeError: never;
    readError: ConnectionEntToTabError;
    notFoundError: BackendConnectionDoesNotExistError;
  };
  dashboards: {
    tab: DashboardTab;
    writeError: never;
    readError: DashboardEntToTabError;
    notFoundError: BackendDashboardDoesNotExistError;
  };
  dconfigs: {
    tab: DconfigTab;
    writeError: never;
    readError: DconfigEntToTabError;
    notFoundError: BackendDconfigDoesNotExistError;
  };
  envs: {
    tab: EnvTab;
    writeError: never;
    readError: EnvEntToTabError;
    notFoundError: BackendEnvDoesNotExistError;
  };
  givens: {
    tab: GivenTab;
    writeError: never;
    readError: GivenEntToTabError;
    notFoundError: BackendGivenDoesNotExistError;
  };
  kits: {
    tab: KitTab;
    writeError: never;
    readError: KitEntToTabError;
    notFoundError: BackendKitDoesNotExistError;
  };
  mconfigs: {
    tab: MconfigTab;
    writeError: never;
    readError: MconfigEntToTabError;
    notFoundError: BackendMconfigDoesNotExistError;
  };
  members: {
    tab: MemberTab;
    writeError: MemberTabToEntError;
    readError: MemberEntToTabError;
    notFoundError: BackendMemberDoesNotExistError;
  };
  modelFieldLeafs: {
    tab: ModelFieldLeafTab;
    writeError: never;
    readError: never;
    notFoundError: never;
  };
  models: {
    tab: ModelTab;
    writeError: never;
    readError: ModelEntToTabError;
    notFoundError: BackendModelDoesNotExistError;
  };
  notes: {
    tab: NoteTab;
    writeError: never;
    readError: NoteEntToTabError;
    notFoundError: BackendNoteDoesNotExistError;
  };
  ocEvents: {
    tab: OcEventTab;
    writeError: never;
    readError: OcEventEntToTabError;
    notFoundError: BackendOcEventDoesNotExistError;
  };
  ocMessages: {
    tab: OcMessageTab;
    writeError: never;
    readError: OcMessageEntToTabError;
    notFoundError: BackendOcMessageDoesNotExistError;
  };
  ocParts: {
    tab: OcPartTab;
    writeError: never;
    readError: OcPartEntToTabError;
    notFoundError: BackendOcPartDoesNotExistError;
  };
  ocSessions: {
    tab: OcSessionTab;
    writeError: never;
    readError: OcSessionEntToTabError;
    notFoundError: BackendOcSessionDoesNotExistError;
  };
  orgs: {
    tab: OrgTab;
    writeError: OrgTabToEntError;
    readError: OrgEntToTabError;
    notFoundError: BackendOrgDoesNotExistError;
  };
  projects: {
    tab: ProjectTab;
    writeError: ProjectTabToEntError;
    readError: ProjectEntToTabError;
    notFoundError: BackendProjectDoesNotExistError;
  };
  providers: {
    tab: ProviderTab;
    writeError: never;
    readError: ProviderEntToTabError;
    notFoundError: BackendProviderDoesNotExistError;
  };
  queries: {
    tab: QueryTab;
    writeError: QueryTabToEntError;
    readError: QueryEntToTabError;
    notFoundError: BackendQueryDoesNotExistError;
  };
  reports: {
    tab: ReportTab;
    writeError: never;
    readError: ReportEntToTabError;
    notFoundError: BackendReportNotFoundError;
  };
  roles: {
    tab: RoleTab;
    writeError: never;
    readError: RoleEntToTabError;
    notFoundError: BackendRoleDoesNotExistError;
  };
  sessions: {
    tab: SessionTab;
    writeError: never;
    readError: SessionEntToTabError;
    notFoundError: BackendSessionNotFoundError;
  };
  structs: {
    tab: StructTab;
    writeError: never;
    readError: StructEntToTabError;
    notFoundError: BackendStructDoesNotExistError;
  };
  uconfigs: {
    tab: UconfigTab;
    writeError: never;
    readError: UconfigEntToTabError;
    notFoundError: BackendUconfigDoesNotExistError;
  };
  users: {
    tab: UserTab;
    writeError: UserTabToEntError;
    readError: UserEntToTabError;
    notFoundError: BackendUserDoesNotExistError;
  };
};

export type DbTableKey = Exclude<keyof DbTableDefinitionMap, 'modelFieldLeafs'>;

export type DbTableEnt<Key extends keyof DbTableDefinitionMap> =
  (typeof schemaPostgres)[`${Key}Table`]['$inferSelect'];

export type DbTableTab<Key extends keyof DbTableDefinitionMap> =
  DbTableDefinitionMap[Key]['tab'];

export type DbTableReadError<Key extends DbTableKey> =
  DbTableDefinitionMap[Key]['readError'];

export type DbTableWriteError<Key extends keyof DbTableDefinitionMap> =
  DbTableDefinitionMap[Key]['writeError'];

export type DbTableNotFoundError<Key extends DbTableKey> =
  DbTableDefinitionMap[Key]['notFoundError'];

export type DbTableQueryErrorMap = {
  [Key in DbTableKey]: {
    findFirst: DbTableReadError<Key>;
    findMany: DbTableReadError<Key>;
    findFirstCheckExists: DbTableReadError<Key> | DbTableNotFoundError<Key>;
  };
};
