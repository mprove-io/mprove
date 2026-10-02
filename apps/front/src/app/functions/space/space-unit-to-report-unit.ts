import type { ReportUnit } from '#common/types/backend/parts/report-unit';
import type { SpaceUnit } from '#common/types/backend/parts/space-unit';

export function spaceUnitToReportUnit(item: {
  spaceUnit: SpaceUnit;
}): ReportUnit {
  let { spaceUnit } = item;

  return {
    type: 'reportUnit',
    id: spaceUnit.id,
    reportId: spaceUnit.unitId,
    title: spaceUnit.title,
    filePath: spaceUnit.filePath,
    space: spaceUnit.space,
    accessRoles: spaceUnit.accessRoles,
    accessRolesCombined: spaceUnit.accessRolesCombined,
    author: spaceUnit.author,
    canEditOrDeleteReport: spaceUnit.canEditOrDeleteUnit,
    isFavorite: spaceUnit.isFavorite,
    draft: false,
    spaceFullTitle: spaceUnit.spaceFullTitle
  };
}
