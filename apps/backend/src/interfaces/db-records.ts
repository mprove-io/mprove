import { AvatarEnx } from '~backend/drizzle/postgres/schema/avatars';
import { BranchEnx } from '~backend/drizzle/postgres/schema/branches';
import { BridgeEnx } from '~backend/drizzle/postgres/schema/bridges';
import { ChartEnx } from '~backend/drizzle/postgres/schema/charts';
import { ConnectionEnx } from '~backend/drizzle/postgres/schema/connections';
import { DashboardEnx } from '~backend/drizzle/postgres/schema/dashboards';
import { EnvEnx } from '~backend/drizzle/postgres/schema/envs';
import { KitEnx } from '~backend/drizzle/postgres/schema/kits';
import { MconfigEnx } from '~backend/drizzle/postgres/schema/mconfigs';
import { MemberEnx } from '~backend/drizzle/postgres/schema/members';
import { ModelEnx } from '~backend/drizzle/postgres/schema/models';
import { NoteEnx } from '~backend/drizzle/postgres/schema/notes';
import { OrgEnx } from '~backend/drizzle/postgres/schema/orgs';
import { ProjectEnx } from '~backend/drizzle/postgres/schema/projects';
import { QueryEnx } from '~backend/drizzle/postgres/schema/queries';
import { ReportEnx } from '~backend/drizzle/postgres/schema/reports';
import { StructEnx } from '~backend/drizzle/postgres/schema/structs';
import { UserEnx } from '~backend/drizzle/postgres/schema/users';

export class DbRecords {
  avatars?: AvatarEnx[];
  branches?: BranchEnx[];
  bridges?: BridgeEnx[];
  connections?: ConnectionEnx[];
  dashboards?: DashboardEnx[];
  envs?: EnvEnx[];
  kits?: KitEnx[];
  mconfigs?: MconfigEnx[];
  members?: MemberEnx[];
  models?: ModelEnx[];
  notes?: NoteEnx[];
  orgs?: OrgEnx[];
  projects?: ProjectEnx[];
  queries?: QueryEnx[];
  reports?: ReportEnx[];
  structs?: StructEnx[];
  users?: UserEnx[];
  charts?: ChartEnx[];
}
