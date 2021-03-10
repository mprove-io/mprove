import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToEntityDashboard(
  x: common.Dashboard
): entities.DashboardEntity {
  return {
    struct_id: x.structId,
    dashboard_id: x.dashboardId,
    file_path: x.filePath,
    content: x.content,
    access_users: x.accessUsers,
    access_roles: x.accessRoles,
    title: x.title,
    gr: x.gr,
    hidden: common.booleanToEnum(x.hidden),
    fields: x.fields,
    reports: x.reports,
    temp: common.booleanToEnum(x.temp),
    description: x.description,
    server_ts: x.serverTs.toString()
  };
}
