import type { ChartTab } from '#backend/drizzle/postgres/tables/charts';
import { makeChartFullId } from '#backend/functions/hash/make-chart-full-id/make-chart-full-id';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Chart } from '#common/types/blockml/parts/chart/chart';
import type { ChartType } from '#common/types/blockml/parts/chart/chart-type';

export function chartApiToTab(item: {
  apiChart: Chart;
  chartType: ChartType;
}): ChartTab {
  let { apiChart, chartType } = item;

  if (isUndefined(apiChart)) {
    return;
  }

  let chart: ChartTab = {
    chartFullId: makeChartFullId({
      structId: apiChart.structId,
      chartId: apiChart.chartId
    }),
    structId: apiChart.structId,
    chartId: apiChart.chartId,
    modelId: apiChart.modelId,
    creatorId: apiChart.creatorId,
    chartType: chartType,
    draft: apiChart.draft,
    isExplorer: apiChart.isExplorer,
    sessionId: apiChart.sessionId,
    chartYaml: apiChart.chartYaml,
    title: apiChart.title,
    modelLabel: apiChart.modelLabel,
    filePath: apiChart.filePath,
    space: apiChart.space,
    accessRoles: apiChart.accessRoles,
    accessRolesCombined: apiChart.accessRolesCombined,
    tiles: apiChart.tiles,
    keyTag: undefined,
    serverTs: apiChart.serverTs
  };

  return chart;
}
