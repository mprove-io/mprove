import type { ChartTab } from '#backend/drizzle/postgres/tables/charts';
import type { ModelTab } from '#backend/drizzle/postgres/tables/models';
import { getUnitAuthor } from '#backend/functions/units/get-unit-author/get-unit-author';
import type { Member } from '#common/types/backend/parts/member';
import type { SpaceUnit } from '#common/types/backend/parts/space-unit';

export function makeChartSpaceUnit(item: {
  chart: ChartTab;
  model: ModelTab;
  member: Member;
  favoriteChartIds: string[];
}): SpaceUnit {
  let { chart, member, favoriteChartIds } = item;

  let author: string = getUnitAuthor({
    filePath: chart.filePath
  });

  return {
    type: 'spaceUnit',
    id: chart.chartId,
    unitId: chart.chartId,
    title: chart.title || chart.chartId,
    filePath: chart.filePath,
    space: chart.space,
    accessRoles: chart.accessRoles,
    accessRolesCombined: chart.accessRolesCombined,
    author: author,
    canEditOrDeleteUnit:
      member.isEditor === true ||
      member.isAdmin === true ||
      author === member.alias,
    isFavorite: favoriteChartIds.indexOf(chart.chartId) > -1,
    spaceFullTitle: '',
    modelId: chart.modelId,
    modelLabel: chart.modelLabel,
    chartType: chart.chartType,
    iconPath: undefined
  };
}
