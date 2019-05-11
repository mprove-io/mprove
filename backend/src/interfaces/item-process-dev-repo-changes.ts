import { entities } from '../barrels/entities';

export interface ItemProcessDevRepoChanges {
  deleted_dev_files: entities.FileEntity[];
  changed_dev_files: entities.FileEntity[];
  new_dev_files: entities.FileEntity[];
  errors: entities.ErrorEntity[];
  models: entities.ModelEntity[];
  views: entities.ViewEntity[];
  dashboards: entities.DashboardEntity[];
  dev_repo: entities.RepoEntity;
}
