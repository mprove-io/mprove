import { schemaPostgres } from '~backend/barrels/schema-postgres';

export class DbRecords {
  avatars?: schemaPostgres.AvatarEnt[];
  branches?: schemaPostgres.BranchEnt[];
  bridges?: schemaPostgres.BridgeEnt[];
  connections?: schemaPostgres.ConnectionEnt[];
  dashboards?: schemaPostgres.DashboardEnt[];
  envs?: schemaPostgres.EnvEnt[];
  kits?: schemaPostgres.KitEnt[];
  mconfigs?: schemaPostgres.MconfigEnt[];
  members?: schemaPostgres.MemberEnt[];
  metrics?: schemaPostgres.MetricEnt[];
  models?: schemaPostgres.ModelEnt[];
  notes?: schemaPostgres.NoteEnt[];
  orgs?: schemaPostgres.OrgEnt[];
  projects?: schemaPostgres.ProjectEnt[];
  queries?: schemaPostgres.QueryEnt[];
  reports?: schemaPostgres.ReportEnt[];
  structs?: schemaPostgres.StructEnt[];
  users?: schemaPostgres.UserEnt[];
  charts?: schemaPostgres.ChartEnt[];
}
