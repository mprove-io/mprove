import { entities } from '../barrels/entities';

export interface ItemStructCopy {
  models: entities.ModelEntity[];
  dashboards: entities.DashboardEntity[];
  mconfigs: entities.MconfigEntity[];
  errors: entities.ErrorEntity[];
}
