import { common } from '~blockml/barrels/common';
import { STORE_MODEL_PREFIX } from '~common/constants/top';
import { wrapTiles } from './wrap-tiles';

export function wrapCharts(item: {
  structId: string;
  projectId: string;
  envId: string;
  timezone: string;
  models: common.FileModel[];
  stores: common.FileStore[];
  charts: common.FileChart[];
}) {
  let { structId, projectId, models, stores, charts, envId, timezone } = item;

  let apiCharts: common.Chart[] = [];
  let chartMconfigs: common.Mconfig[] = [];
  let chartQueries: common.Query[] = [];

  charts.forEach(x => {
    let { apiTiles, mconfigs, queries } = wrapTiles({
      projectId: projectId,
      structId: structId,
      models: models,
      stores: stores,
      tiles: x.tiles,
      envId: envId,
      timezone: timezone
    });

    chartMconfigs = [...chartMconfigs, ...mconfigs];
    chartQueries = [...chartQueries, ...queries];

    let isStore = x.tiles[0].model.startsWith(STORE_MODEL_PREFIX);
    let model;
    let store: common.FileStore;

    if (isStore === true) {
      store = stores.find(
        m => `${STORE_MODEL_PREFIX}_${m.name}` === x.tiles[0].model
      );
    } else {
      model = models.find(m => m.name === x.tiles[0].model);
    }

    apiCharts.push({
      structId: structId,
      chartId: x.name,
      draft: false,
      creatorId: undefined,
      title: x.tiles[0].title,
      modelId: x.tiles[0].model,
      modelLabel: isStore === true ? store.label : model.label,
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
