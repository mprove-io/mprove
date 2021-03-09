import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiDashboard(
  x: entities.DashboardEntity
): common.Dashboard {
  return {
    structId: x.struct_id,
    dashboardId: x.dashboard_id,
    content: x.content,
    accessUsers: x.access_users,
    accessRoles: x.access_roles,
    title: x.title,
    gr: x.gr,
    hidden: common.enumToBoolean(x.hidden),
    fields: x.fields,
    description: x.description,
    reports: x.reports,
    temp: common.enumToBoolean(x.temp),
    serverTs: Number(x.server_ts)
  };
}
