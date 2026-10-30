import type { ChartTab } from '#backend/drizzle/postgres/tables/charts';
import type { ModelTab } from '#backend/drizzle/postgres/tables/models';
import { getUnitAuthor } from '#backend/functions/get-unit-author/get-unit-author';
import type { ChartUnit } from '#common/types/backend/parts/chart/chart-unit';
import type { Member } from '#common/types/backend/parts/member';

export function makeChartUnit(item: {
  chart: ChartTab;
  model: ModelTab;
  member: Member;
  favoriteChartIds: string[];
  space: string | undefined;
  spaceFullTitle: string;
}): ChartUnit {
  let { chart, member, favoriteChartIds, space, spaceFullTitle } = item;

  let author: string = getUnitAuthor({
    filePath: chart.filePath
  });

  return {
    type: 'chartUnit',
    id: chart.chartId,
    chartId: chart.chartId,
    modelId: chart.modelId,
    modelLabel: chart.modelLabel,
    chartType: chart.chartType,
    iconPath: undefined,
    draft: chart.draft,
    title: chart.title || chart.chartId,
    filePath: chart.filePath,
    space: space,
    accessRoles: chart.accessRoles,
    accessRolesCombined: chart.accessRolesCombined,
    author: author,
    canEditOrDeleteChart:
      member.isEditor === true ||
      member.isAdmin === true ||
      author === member.alias,
    isFavorite: favoriteChartIds.indexOf(chart.chartId) > -1,
    spaceFullTitle: spaceFullTitle
  };
}
