import type { DashboardUnit } from '#common/zod/backend/dashboard-unit';
import type { SpaceUnit } from '#common/zod/backend/space-unit';

export function spaceUnitToDashboardUnit(item: {
  spaceUnit: SpaceUnit;
}): DashboardUnit {
  let { spaceUnit } = item;

  return {
    type: 'dashboardUnit',
    id: spaceUnit.id,
    dashboardId: spaceUnit.unitId,
    draft: false,
    title: spaceUnit.title,
    filePath: spaceUnit.filePath,
    space: spaceUnit.space,
    accessRoles: spaceUnit.accessRoles,
    accessRolesCombined: spaceUnit.accessRolesCombined,
    author: spaceUnit.author,
    canEditOrDeleteDashboard: spaceUnit.canEditOrDeleteUnit,
    isFavorite: spaceUnit.isFavorite,
    spaceFullTitle: spaceUnit.spaceFullTitle
  };
}
