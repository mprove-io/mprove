import type { DashboardTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { HashService } from '#backend/services/hash/hash.service';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Dashboard } from '#common/types/blockml/parts/dashboard/dashboard';

export function dashboardApiToTab(item: {
  hashService: HashService;
  apiDashboard: Dashboard;
}): DashboardTab {
  let { hashService, apiDashboard } = item;

  if (isUndefined(apiDashboard)) {
    return;
  }

  let dashboard: DashboardTab = {
    dashboardFullId: hashService.makeDashboardFullId({
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
