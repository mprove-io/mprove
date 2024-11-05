import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';

export function wrapToEntityDashboard(item: {
  dashboard: common.Dashboard;
  dashboardFullId?: string;
}): schemaPostgres.DashboardEnt {
  let { dashboard, dashboardFullId } = item;

  return {
    dashboardFullId: dashboardFullId || common.makeId(),
    structId: dashboard.structId,
    dashboardId: dashboard.dashboardId,
    filePath: dashboard.filePath,
    content: dashboard.content,
    accessUsers: dashboard.accessUsers,
    accessRoles: dashboard.accessRoles,
    title: dashboard.title,
    gr: dashboard.gr,
    hidden: dashboard.hidden,
    fields: dashboard.fields,
    tiles: dashboard.tiles,
    temp: dashboard.temp,
    description: dashboard.description,
    serverTs: dashboard.serverTs
  };
}
