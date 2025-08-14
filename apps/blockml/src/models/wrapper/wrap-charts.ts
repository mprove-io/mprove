import { common } from '~blockml/barrels/common';
// import { STORE_MODEL_PREFIX } from '~common/constants/top';
import { wrapTiles } from './wrap-tiles';

export function wrapCharts(item: {
  structId: string;
  projectId: string;
  envId: string;
  timezone: string;
  mods: common.FileMod[];
  models: common.FileModel[];
  apiModels: common.Model[];
  stores: common.FileStore[];
  charts: common.FileChart[];
}) {
  let {
    structId,
    projectId,
    models,
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
      models: models,
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

    // let isStore = x.tiles[0].model.startsWith(STORE_MODEL_PREFIX);

    // if (isStore === true) {
    //   store = stores.find(
    //     s => `${STORE_MODEL_PREFIX}_${s.name}` === x.tiles[0].model
    //   );
    // } else if (common.isDefined(x.tiles[0].query)) {
    //   mod = mods.find(m => m.name === x.tiles[0].model);
    // } else {
    //   model = models.find(m => m.name === x.tiles[0].model);
    // }

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
