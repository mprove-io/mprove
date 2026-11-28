import type { ChartTab } from '#backend/drizzle/postgres/tables/charts';
import type { MconfigTab } from '#backend/drizzle/postgres/tables/mconfigs';
import type { ModelTab } from '#backend/drizzle/postgres/tables/models';
import { getUnitAuthor } from '#backend/functions/get-unit-author/get-unit-author';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { CatalogSearchField } from '#common/types/backend/parts/catalog-search-field';
import type { Member } from '#common/types/backend/parts/member';
import type { SpaceUnit } from '#common/types/backend/parts/space-unit';
import type { ModelField } from '#common/types/blockml/parts/model/model-field';

export function makeChartSpaceUnit(item: {
  chart: ChartTab;
  modelById: Map<string, ModelTab>;
  mconfigById: Map<string, MconfigTab>;
  member: Member;
  favoriteChartIds: string[];
}): SpaceUnit {
  let { chart, modelById, mconfigById, member, favoriteChartIds } = item;

  let author: string = getUnitAuthor({
    filePath: chart.filePath
  });

  let fieldById = new Map<string, CatalogSearchField>();

  chart.tiles.forEach(tile => {
    let mconfig: MconfigTab = mconfigById.get(tile.mconfigId);

    if (isUndefined(mconfig)) {
      return;
    }

    let model: ModelTab = modelById.get(mconfig.modelId);

    mconfig.select.forEach(fieldId => {
      let field: ModelField = model?.fields?.find(x => x.id === fieldId);

      fieldById.set(JSON.stringify([mconfig.modelId, fieldId]), {
        id: fieldId,
        label: field?.label || fieldId
      });
    });
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
    iconPath: undefined,
    selectedFields: [...fieldById.values()]
  };
}
