import { common } from '~blockml/barrels/common';
import { wrapTiles } from './wrap-tiles';

export function wrapCharts(item: {
  structId: string;
  projectId: string;
  envId: string;
  timezone: string;
  mods: common.FileMod[];
  apiModels: common.Model[];
  stores: common.FileStore[];
  charts: common.FileChart[];
}) {
  let {
    structId,
    projectId,
    apiModels,
    mods,
    stores,
    charts,
    envId,
    timezone
  } = item;

  let apiCharts: common.Chart[] = [];
  let chartMconfigs: common.Mconfig[] = [];
  let chartQueries: common.Query[] = [];

  charts.forEach(x => {
    let { apiTiles, mconfigs, queries } = wrapTiles({
      projectId: projectId,
      structId: structId,
      apiModels: apiModels,
      mods: mods,
      stores: stores,
      tiles: x.tiles,
      envId: envId,
      timezone: timezone
    });

    chartMconfigs = [...chartMconfigs, ...mconfigs];
    chartQueries = [...chartQueries, ...queries];

    // let mod: common.FileMod;
    // let model: common.FileModel;
    // let store: common.FileStore;

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
      gr: x.group,
      hidden: common.toBooleanFromLowercaseString(x.hidden),
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
