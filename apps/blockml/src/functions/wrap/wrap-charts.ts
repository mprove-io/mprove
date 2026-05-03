import { MconfigParentTypeEnum } from '#common/enums/mconfig-parent-type.enum';
import type { Chart } from '#common/zod/blockml/chart';
import type { FileChart } from '#common/zod/blockml/internal/file-chart';
import type { FileStore } from '#common/zod/blockml/internal/file-store';
import type { Mconfig } from '#common/zod/blockml/mconfig';
import type { Model } from '#common/zod/blockml/model';
import type { Query } from '#common/zod/blockml/query';
import { wrapTiles } from './wrap-tiles';

export function wrapCharts(item: {
  structId: string;
  projectId: string;
  envId: string;
  timezone: string;
  apiModels: Model[];
  stores: FileStore[];
  charts: FileChart[];
}) {
  let { structId, projectId, apiModels, stores, charts, envId, timezone } =
    item;

  let apiCharts: Chart[] = [];
  let chartMconfigs: Mconfig[] = [];
  let chartQueries: Query[] = [];

  charts.forEach(x => {
    let { apiTiles, mconfigs, queries } = wrapTiles({
      projectId: projectId,
      structId: structId,
      apiModels: apiModels,
      stores: stores,
      tiles: x.tiles,
      mconfigParentType: MconfigParentTypeEnum.Chart,
      mconfigParentId: x.chart,
      envId: envId,
      timezone: timezone
    });

    chartMconfigs = [...chartMconfigs, ...mconfigs];
    chartQueries = [...chartQueries, ...queries];

    let apiModel = apiModels.find(m => m.modelId === x.tiles[0].model);

    apiCharts.push({
      structId: structId,
      chartId: x.name,
      draft: false,
      isExplorer: undefined,
      sessionId: undefined,
      chartYaml: undefined,
      creatorId: undefined,
      title: x.tiles[0].title,
      modelId: x.tiles[0].model,
      modelLabel: apiModel.label,
      filePath: x.filePath,
      tiles: apiTiles,
      serverTs: 1
    });
  });

  return {
    apiCharts: apiCharts,
    chartMconfigs: chartMconfigs,
    chartQueries: chartQueries
  };
}
