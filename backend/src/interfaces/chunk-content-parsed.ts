import { entities } from '../barrels/entities';

export interface ChunkContentParsed {
  users: entities.UserEntity[];
  projects: entities.ProjectEntity[];
  repos: entities.RepoEntity[];
  files: entities.FileEntity[];
  queries: entities.QueryEntity[];
  models: entities.ModelEntity[];
  views: entities.ViewEntity[];
  mconfigs: entities.MconfigEntity[];
  dashboards: entities.DashboardEntity[];
  errors: entities.ErrorEntity[];
  members: entities.MemberEntity[];
}
