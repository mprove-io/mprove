import { entities } from '~backend/barrels/entities';

export class Records {
  users?: entities.UserEntity[];
  orgs?: entities.OrgEntity[];
  projects?: entities.ProjectEntity[];
  members?: entities.MemberEntity[];
  connections?: entities.ConnectionEntity[];
  structs?: entities.StructEntity[];
  branches?: entities.BranchEntity[];
  vizs?: entities.VizEntity[];
  queries?: entities.QueryEntity[];
  models?: entities.ModelEntity[];
  mconfigs?: entities.MconfigEntity[];
  dashboards?: entities.DashboardEntity[];
}
