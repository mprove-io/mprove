import type { DashboardTab } from '#backend/drizzle/postgres/schema/_tabs';
import { makeDashboardFullId } from '#backend/functions/hash/make-dashboard-full-id/make-dashboard-full-id';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Dashboard } from '#common/types/blockml/parts/dashboard/dashboard';

export function dashboardApiToTab(item: {
  apiDashboard: Dashboard;
}): DashboardTab {
  let { apiDashboard } = item;

  if (isUndefined(apiDashboard)) {
    return;
  }

  let dashboard: DashboardTab = {
    dashboardFullId: makeDashboardFullId({
      structId: apiDashboard.structId,
      dashboardId: apiDashboard.dashboardId
    }),
    structId: apiDashboard.structId,
    dashboardId: apiDashboard.dashboardId,
    draft: apiDashboard.draft,
    creatorId: apiDashboard.creatorId,
    filePath: apiDashboard.filePath,
    space: apiDashboard.space,
    accessRoles: apiDashboard.accessRoles,
    accessRolesCombined: apiDashboard.accessRolesCombined,
    title: apiDashboard.title,
    fields: apiDashboard.fields,
    tiles: apiDashboard.tiles,
    content: apiDashboard.content,
    keyTag: undefined,
    serverTs: apiDashboard.serverTs
  };

  return dashboard;
}
