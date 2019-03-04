import { entities } from '../barrels/entities';

export interface ItemProcessDashboard {
  dashboard: entities.DashboardEntity;
  mconfigs: entities.MconfigEntity[];
  queries: entities.QueryEntity[];
}
