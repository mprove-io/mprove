import { entities } from '../barrels/entities';

export interface ItemStructCopy {
  models: entities.ModelEntity[];
  views: entities.ViewEntity[];
  dashboards: entities.DashboardEntity[];
  mconfigs: entities.MconfigEntity[];
  errors: entities.ErrorEntity[];
}
