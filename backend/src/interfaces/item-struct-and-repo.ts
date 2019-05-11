import { entities } from '../barrels/entities';

export interface ItemStructAndRepo {
  models: entities.ModelEntity[];
  views: entities.ViewEntity[];
  dashboards: entities.DashboardEntity[];
  errors: entities.ErrorEntity[];
  repo: entities.RepoEntity;
}
