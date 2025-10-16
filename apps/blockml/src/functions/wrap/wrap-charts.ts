import { QueryParentTypeEnum } from '~common/enums/query-parent-type.enum';
import { Chart } from '~common/interfaces/blockml/chart';
import { FileChart } from '~common/interfaces/blockml/internal/file-chart';
import { FileStore } from '~common/interfaces/blockml/internal/file-store';
import { Mconfig } from '~common/interfaces/blockml/mconfig';
import { Model } from '~common/interfaces/blockml/model';
import { Query } from '~common/interfaces/blockml/query';
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
      queryParentType: QueryParentTypeEnum.Chart,
      queryParentId: x.chart,
      envId: envId,
      timezone: timezone
    });

    chartMconfigs = [...chartMconfigs, ...mconfigs];
    chartQueries = [...chartQueries, ...queries];

    // let mod: FileMod;
    // let model: FileModel;
    // let store: FileStore;

    let apiModel = apiModels.find(m => m.modelId === x.tiles[0].model);

    apiCharts.push({
      structId: structId,
      chartId: x.name,
      draft: false,
      creatorId: undefined,
      title: x.tiles[0].title,
      modelId: x.tiles[0].model,
      modelLabel: apiModel.label,
      // store?.label || mod?.label || model?.label,
      filePath: x.filePath,
      accessRoles: x.access_roles || [],
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
