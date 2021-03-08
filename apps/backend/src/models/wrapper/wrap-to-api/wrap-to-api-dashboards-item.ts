import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiDashboardsItem(
  dashboard: entities.DashboardEntity
): common.DashboardsItem {
  return {
    dashboardId: dashboard.dashboard_id,
    title: dashboard.title,
    gr: dashboard.gr,
    hidden: common.enumToBoolean(dashboard.hidden)
  };
}
