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
  MessageTab,
  ModelTab,
  NoteTab,
  OrgTab,
  PartTab,
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
  messages?: MessageTab[];
  models?: ModelTab[];
  notes?: NoteTab[];
  orgs?: OrgTab[];
  parts?: PartTab[];
  projects?: ProjectTab[];
  queries?: QueryTab[];
  reports?: ReportTab[];
  sessions?: SessionTab[];
  structs?: StructTab[];
  users?: UserTab[];
  charts?: ChartTab[];
}
