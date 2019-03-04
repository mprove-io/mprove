import { entities } from '../barrels/entities';

export interface ItemStructAndRepo {
  models: entities.ModelEntity[];
  dashboards: entities.DashboardEntity[];
  errors: entities.ErrorEntity[];
  repo: entities.RepoEntity;
}
