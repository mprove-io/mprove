import type { DashboardTab } from '#backend/drizzle/postgres/tables/dashboards';
import { getUnitAuthor } from '#backend/functions/get-unit-author/get-unit-author';
import type { DashboardUnit } from '#common/types/backend/parts/dashboard/dashboard-unit';
import type { Member } from '#common/types/backend/parts/member';

export function makeDashboardUnit(item: {
  dashboard: DashboardTab;
  member: Member;
  favoriteDashboardIds: string[];
  space: string | undefined;
  spaceFullTitle: string;
}): DashboardUnit {
  let { dashboard, member, favoriteDashboardIds, space, spaceFullTitle } = item;

  let author: string = getUnitAuthor({
    filePath: dashboard.filePath
  });

  return {
    type: 'dashboardUnit',
    id: dashboard.dashboardId,
    dashboardId: dashboard.dashboardId,
    draft: dashboard.draft,
    title: dashboard.title || dashboard.dashboardId,
    filePath: dashboard.filePath,
    space: space,
    accessRoles: dashboard.accessRoles,
    accessRolesCombined: dashboard.accessRolesCombined,
    author: author,
    canEditOrDeleteDashboard:
      member.isEditor === true ||
      member.isAdmin === true ||
      author === member.alias,
    isFavorite: favoriteDashboardIds.indexOf(dashboard.dashboardId) > -1,
    spaceFullTitle: spaceFullTitle
  };
}
