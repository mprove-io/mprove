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

export class DbTabsPack {
  avatars?: AvatarTab[];
  branches?: BranchTab[];
  bridges?: BridgeTab[];
  cachedColumns?: CachedColumnTab[];
  cachedParts?: CachedPartTab[];
  connections?: ConnectionTab[];
  dashboards?: DashboardTab[];
  dconfigs?: DconfigTab[];
  envs?: EnvTab[];
  givens?: GivenTab[];
  ocEvents?: OcEventTab[];
  kits?: KitTab[];
  mconfigs?: MconfigTab[];
  members?: MemberTab[];
  ocMessages?: OcMessageTab[];
  modelFieldLeafs?: ModelFieldLeafTab[];
  models?: ModelTab[];
  notes?: NoteTab[];
  ocSessions?: OcSessionTab[];
  orgs?: OrgTab[];
  ocParts?: OcPartTab[];
  projects?: ProjectTab[];
  providers?: ProviderTab[];
  queries?: QueryTab[];
  reports?: ReportTab[];
  roles?: RoleTab[];
  sessions?: SessionTab[];
  structs?: StructTab[];
  uconfigs?: UconfigTab[];
  users?: UserTab[];
  charts?: ChartTab[];
}
