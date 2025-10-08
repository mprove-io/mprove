import { AvatarTab } from '~backend/drizzle/postgres/tabs/avatar-tab';
import { BranchTab } from '~backend/drizzle/postgres/tabs/branch-tab';
import { BridgeTab } from '~backend/drizzle/postgres/tabs/bridge-tab';
import { ChartTab } from '~backend/drizzle/postgres/tabs/chart-tab';
import { ConnectionTab } from '~backend/drizzle/postgres/tabs/connection-tab';
import { DashboardTab } from '~backend/drizzle/postgres/tabs/dashboard-tab';
import { EnvTab } from '~backend/drizzle/postgres/tabs/env-tab';
import { KitTab } from '~backend/drizzle/postgres/tabs/kit-tab';
import { MconfigTab } from '~backend/drizzle/postgres/tabs/mconfig-tab';
import { MemberTab } from '~backend/drizzle/postgres/tabs/member-tab';
import { ModelTab } from '~backend/drizzle/postgres/tabs/model-tab';
import { NoteTab } from '~backend/drizzle/postgres/tabs/note-tab';
import { OrgTab } from '~backend/drizzle/postgres/tabs/org-tab';
import { ProjectTab } from '~backend/drizzle/postgres/tabs/project-tab';
import { QueryTab } from '~backend/drizzle/postgres/tabs/query-tab';
import { ReportTab } from '~backend/drizzle/postgres/tabs/report-tab';
import { StructTab } from '~backend/drizzle/postgres/tabs/struct-tab';
import { UserTab } from '~backend/drizzle/postgres/tabs/user-tab';

export class DbRecords {
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
