import type {
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
  OcEventTab,
  OcMessageTab,
  OcPartTab,
  OcSessionTab,
  OrgTab,
  ProjectTab,
  QueryTab,
  ReportTab,
  SessionTab,
  StructTab,
  UconfigTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';

export class DbTabsPack {
  avatars?: AvatarTab[];
  branches?: BranchTab[];
  bridges?: BridgeTab[];
  connections?: ConnectionTab[];
  dashboards?: DashboardTab[];
  dconfigs?: DconfigTab[];
  envs?: EnvTab[];
  ocEvents?: OcEventTab[];
  kits?: KitTab[];
  mconfigs?: MconfigTab[];
  members?: MemberTab[];
  ocMessages?: OcMessageTab[];
  models?: ModelTab[];
  notes?: NoteTab[];
  ocSessions?: OcSessionTab[];
  orgs?: OrgTab[];
  ocParts?: OcPartTab[];
  projects?: ProjectTab[];
  queries?: QueryTab[];
  reports?: ReportTab[];
  sessions?: SessionTab[];
  structs?: StructTab[];
  uconfigs?: UconfigTab[];
  users?: UserTab[];
  charts?: ChartTab[];
}
