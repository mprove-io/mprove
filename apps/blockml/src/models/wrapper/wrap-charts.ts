import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { wrapTiles } from './wrap-tiles';

export function wrapCharts(item: {
  structId: string;
  orgId: string;
  projectId: string;
  envId: string;
  timezone: string;
  models: common.FileModel[];
  charts: common.FileChart[];
}) {
  let { structId, orgId, projectId, models, charts, envId, timezone } = item;

  let apiCharts: common.Chart[] = [];
  let chartMconfigs: common.Mconfig[] = [];
  let chartQueries: common.Query[] = [];

  charts.forEach(x => {
    let { apiTiles, mconfigs, queries } = wrapTiles({
      orgId: orgId,
      projectId: projectId,
      structId: structId,
      models: models,
      tiles: x.tiles,
      envId: envId,
      timezone: timezone
    });

    chartMconfigs = [...chartMconfigs, ...mconfigs];
    chartQueries = [...chartQueries, ...queries];

    let model = models.find(m => m.name === x.tiles[0].model);

    apiCharts.push({
      structId: structId,
      chartId: x.name,
      title: x.tiles[0].title,
      modelId: model.name,
      modelLabel: model.label,
      filePath: x.filePath,
      accessUsers: x.access_users || [],
      accessRoles: x.access_roles || [],
      gr: x.group,
      hidden: helper.toBooleanFromLowercaseString(x.hidden),
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
