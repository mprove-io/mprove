import { entities } from '../barrels/entities';

export interface ItemStruct {
  models: entities.ModelEntity[];
  dashboards: entities.DashboardEntity[];
  mconfigs: entities.MconfigEntity[];
  errors: entities.ErrorEntity[];
  queries: entities.QueryEntity[];
  udfs_content: string;
  pdts_sorted: string;
}
