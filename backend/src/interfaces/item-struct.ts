import { entities } from '../barrels/entities';

export interface ItemStruct {
  models: entities.ModelEntity[];
  views: entities.ViewEntity[];
  dashboards: entities.DashboardEntity[];
  mconfigs: entities.MconfigEntity[];
  errors: entities.ErrorEntity[];
  queries: entities.QueryEntity[];
  udfs_content: string;
  pdts_sorted: string;
}
