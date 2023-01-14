import { entities } from '~backend/barrels/entities';

export class Records {
  users?: entities.UserEntity[];
  avatars?: entities.AvatarEntity[];
  orgs?: entities.OrgEntity[];
  projects?: entities.ProjectEntity[];
  members?: entities.MemberEntity[];
  connections?: entities.ConnectionEntity[];
  structs?: entities.StructEntity[];
  branches?: entities.BranchEntity[];
  bridges?: entities.BridgeEntity[];
  envs?: entities.EnvEntity[];
  evs?: entities.EvEntity[];
  vizs?: entities.VizEntity[];
  queries?: entities.QueryEntity[];
  models?: entities.ModelEntity[];
  metrics?: entities.MetricEntity[];
  reps?: entities.RepEntity[];
  apis?: entities.ApiEntity[];
  mconfigs?: entities.MconfigEntity[];
  dashboards?: entities.DashboardEntity[];
  notes?: entities.NoteEntity[];
}
