import type { DashboardTab } from '#backend/drizzle/postgres/tables/dashboards';
import { getUnitAuthor } from '#backend/functions/get-unit-author/get-unit-author';
import type { Member } from '#common/types/backend/parts/member';
import type { SpaceUnit } from '#common/types/backend/parts/space-unit';

export function makeDashboardSpaceUnit(item: {
  dashboard: DashboardTab;
  member: Member;
  favoriteDashboardIds: string[];
}): SpaceUnit {
  let { dashboard, member, favoriteDashboardIds } = item;

  let author: string = getUnitAuthor({
    filePath: dashboard.filePath
  });

  return {
    type: 'spaceUnit',
    id: dashboard.dashboardId,
    unitId: dashboard.dashboardId,
    title: dashboard.title || dashboard.dashboardId,
    filePath: dashboard.filePath,
    space: dashboard.space,
    accessRoles: dashboard.accessRoles,
    accessRolesCombined: dashboard.accessRolesCombined,
    author: author,
    canEditOrDeleteUnit:
      member.isEditor === true ||
      member.isAdmin === true ||
      author === member.alias,
    isFavorite: favoriteDashboardIds.indexOf(dashboard.dashboardId) > -1,
    spaceFullTitle: ''
  };
}
