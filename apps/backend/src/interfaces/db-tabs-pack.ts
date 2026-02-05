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

export class DbTabsPack {
  avatars?: AvatarTab[];
  branches?: BranchTab[];
  bridges?: BridgeTab[];
  connections?: ConnectionTab[];
  dashboards?: DashboardTab[];
  dconfigs?: DconfigTab[];
  envs?: EnvTab[];
  events?: EventTab[];
  kits?: KitTab[];
  mconfigs?: MconfigTab[];
  members?: MemberTab[];
  models?: ModelTab[];
  notes?: NoteTab[];
  orgs?: OrgTab[];
  projects?: ProjectTab[];
  queries?: QueryTab[];
  reports?: ReportTab[];
  sessions?: SessionTab[];
  structs?: StructTab[];
  users?: UserTab[];
  charts?: ChartTab[];
}
