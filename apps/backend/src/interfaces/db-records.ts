import { AvatarEnt } from '~backend/drizzle/postgres/schema/avatars';
import { BranchEnt } from '~backend/drizzle/postgres/schema/branches';
import { BridgeEnt } from '~backend/drizzle/postgres/schema/bridges';
import { ChartEnt } from '~backend/drizzle/postgres/schema/charts';
import { ConnectionEnt } from '~backend/drizzle/postgres/schema/connections';
import { DashboardEnt } from '~backend/drizzle/postgres/schema/dashboards';
import { EnvEnt } from '~backend/drizzle/postgres/schema/envs';
import { KitEnt } from '~backend/drizzle/postgres/schema/kits';
import { MconfigEnt } from '~backend/drizzle/postgres/schema/mconfigs';
import { MemberEnt } from '~backend/drizzle/postgres/schema/members';
import { ModelEnt } from '~backend/drizzle/postgres/schema/models';
import { NoteEnt } from '~backend/drizzle/postgres/schema/notes';
import { OrgEnt } from '~backend/drizzle/postgres/schema/orgs';
import { ProjectEnt } from '~backend/drizzle/postgres/schema/projects';
import { QueryEnt } from '~backend/drizzle/postgres/schema/queries';
import { ReportEnt } from '~backend/drizzle/postgres/schema/reports';
import { StructEnt } from '~backend/drizzle/postgres/schema/structs';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';

export class DbRecords {
  avatars?: AvatarEnt[];
  branches?: BranchEnt[];
  bridges?: BridgeEnt[];
  connections?: ConnectionEnt[];
  dashboards?: DashboardEnt[];
  envs?: EnvEnt[];
  kits?: KitEnt[];
  mconfigs?: MconfigEnt[];
  members?: MemberEnt[];
  models?: ModelEnt[];
  notes?: NoteEnt[];
  orgs?: OrgEnt[];
  projects?: ProjectEnt[];
  queries?: QueryEnt[];
  reports?: ReportEnt[];
  structs?: StructEnt[];
  users?: UserEnt[];
  charts?: ChartEnt[];
}
