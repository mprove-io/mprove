import type { ChartUnit } from '#common/types/backend/parts/chart-unit';
import type { SpaceUnit } from '#common/types/backend/parts/space-unit';

export function spaceUnitToChartUnit(item: {
  spaceUnit: SpaceUnit;
}): ChartUnit {
  let { spaceUnit } = item;

  return {
    type: 'chartUnit',
    id: spaceUnit.id,
    chartId: spaceUnit.unitId,
    modelId: spaceUnit.modelId,
    modelLabel: spaceUnit.modelLabel,
    chartType: spaceUnit.chartType,
    iconPath: spaceUnit.iconPath,
    draft: false,
    title: spaceUnit.title,
    filePath: spaceUnit.filePath,
    space: spaceUnit.space,
    accessRoles: spaceUnit.accessRoles,
    accessRolesCombined: spaceUnit.accessRolesCombined,
    author: spaceUnit.author,
    canEditOrDeleteChart: spaceUnit.canEditOrDeleteUnit,
    isFavorite: spaceUnit.isFavorite,
    spaceFullTitle: spaceUnit.spaceFullTitle
  };
}
