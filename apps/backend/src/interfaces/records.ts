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
  vizs?: entities.VizEntity[];
  queries?: entities.QueryEntity[];
  models?: entities.ModelEntity[];
  mconfigs?: entities.MconfigEntity[];
  dashboards?: entities.DashboardEntity[];
  notes?: entities.NoteEntity[];
}
