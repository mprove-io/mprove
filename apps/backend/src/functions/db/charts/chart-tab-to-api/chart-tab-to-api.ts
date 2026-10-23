import type { ChartTab } from '#backend/drizzle/postgres/schema/_tabs';
import { makeTilesX } from '#backend/functions/make-tiles-x/make-tiles-x';
import { MPROVE_USERS_FOLDER } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ChartX } from '#common/types/backend/parts/chart/chart-x';
import type { MconfigX } from '#common/types/backend/parts/mconfig/mconfig-x';
import type { Member } from '#common/types/backend/parts/member';
import type { ModelX } from '#common/types/backend/parts/model/model-x';
import type { Query } from '#common/types/blockml/parts/query/query';

export function chartTabToApi(item: {
  chart: ChartTab;
  mconfigs: MconfigX[];
  queries: Query[];
  member: Member;
  isAddMconfigAndQuery: boolean;
  models: ModelX[];
}): ChartX {
  let { chart, mconfigs, queries, member, isAddMconfigAndQuery, models } = item;

  let filePathArray: string[] = isDefined(chart.filePath)
    ? chart.filePath.split('/')
    : [];

  let usersFolderIndex: number = filePathArray.findIndex(
    x => x === MPROVE_USERS_FOLDER
  );

  let author =
    usersFolderIndex > -1 && filePathArray.length > usersFolderIndex + 1
      ? filePathArray[usersFolderIndex + 1]
      : undefined;

  let canEditOrDeleteChart =
    member.isEditor || member.isAdmin || author === member.alias;

  let apiChart: ChartX = {
    structId: chart.structId,
    chartId: chart.chartId,
    draft: chart.draft,
    creatorId: chart.creatorId,
    author: author,
    canEditOrDeleteChart: canEditOrDeleteChart,
    title: chart.title,
    chartType: chart.chartType,
    modelId: chart.modelId,
    modelLabel: chart.modelLabel,
    filePath: chart.filePath,
    space: chart.space,
    accessRoles: chart.accessRoles,
    accessRolesCombined: chart.accessRolesCombined,
    tiles: makeTilesX({
      tiles: chart.tiles,
      mconfigs: mconfigs,
      queries: queries,
      isAddMconfigAndQuery: isAddMconfigAndQuery,
      models: models,
      dashboardExtendedFilters: undefined
    }),
    serverTs: Number(chart.serverTs)
  };

  return apiChart;
}
