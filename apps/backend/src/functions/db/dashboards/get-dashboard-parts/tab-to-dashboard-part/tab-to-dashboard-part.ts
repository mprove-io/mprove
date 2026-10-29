import type { DashboardTab } from '#backend/drizzle/postgres/tables/dashboards';
import { MPROVE_USERS_FOLDER } from '#common/constants/top';
import type { DashboardPart } from '#common/types/backend/parts/dashboard/dashboard-part';
import type { Member } from '#common/types/backend/parts/member';

export function tabToDashboardPart(item: {
  dashboard: DashboardTab;
  member: Member;
}): DashboardPart {
  let { dashboard, member } = item;

  let filePathArray: string[] = dashboard.filePath.split('/');

  let usersFolderIndex: number = filePathArray.findIndex(
    x => x === MPROVE_USERS_FOLDER
  );

  let author =
    usersFolderIndex > -1 && filePathArray.length > usersFolderIndex + 1
      ? filePathArray[usersFolderIndex + 1]
      : undefined;

  let canEditOrDeleteDashboard =
    member.isEditor || member.isAdmin || author === member.alias;

  let dashboardPart: DashboardPart = {
    structId: dashboard.structId,
    dashboardId: dashboard.dashboardId,
    draft: dashboard.draft,
    creatorId: dashboard.creatorId,
    title: dashboard.title,
    filePath: dashboard.filePath,
    space: dashboard.space,
    accessRoles: dashboard.accessRoles,
    accessRolesCombined: dashboard.accessRolesCombined,
    tiles: dashboard.tiles,
    author: author,
    canEditOrDeleteDashboard: canEditOrDeleteDashboard
  };

  return dashboardPart;
}
