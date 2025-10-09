import {
  AvatarTab,
  BranchTab,
  BridgeTab,
  ChartTab,
  ConnectionTab,
  DashboardTab,
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

export class DbTabsPack {
  avatars?: AvatarTab[];
  branches?: BranchTab[];
  bridges?: BridgeTab[];
  connections?: ConnectionTab[];
  dashboards?: DashboardTab[];
  envs?: EnvTab[];
  kits?: KitTab[];
  mconfigs?: MconfigTab[];
  members?: MemberTab[];
  models?: ModelTab[];
  notes?: NoteTab[];
  orgs?: OrgTab[];
  projects?: ProjectTab[];
  queries?: QueryTab[];
  reports?: ReportTab[];
  structs?: StructTab[];
  users?: UserTab[];
  charts?: ChartTab[];
}
