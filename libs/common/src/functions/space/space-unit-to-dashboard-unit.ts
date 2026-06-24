import type { DashboardUnit } from '#common/zod/backend/dashboard-unit';
import type { SpaceUnit } from '#common/zod/backend/space-unit';

export function spaceUnitToDashboardUnit(item: {
  spaceUnit: SpaceUnit;
}): DashboardUnit {
  let { spaceUnit } = item;

  return {
    type: 'dashboardUnit',
    id: spaceUnit.id,
    structId: (spaceUnit as any).structId,
    dashboardId: spaceUnit.unitId,
    draft: false,
    creatorId: (spaceUnit as any).creatorId,
    title: spaceUnit.title,
    filePath: spaceUnit.filePath,
    space: spaceUnit.space,
    accessRoles: spaceUnit.accessRoles,
    accessRolesCombined: spaceUnit.accessRolesCombined,
    tiles: (spaceUnit as any).tiles ?? [],
    author: spaceUnit.author,
    canEditOrDeleteDashboard: spaceUnit.canEditOrDeleteUnit,
    isFavorite: spaceUnit.isFavorite,
    displaySpace: spaceUnit.displaySpace,
    displayAccessRoles: spaceUnit.displayAccessRoles
  };
}
