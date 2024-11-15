import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { wrapTiles } from './wrap-tiles';

export function wrapVizs(item: {
  structId: string;
  orgId: string;
  projectId: string;
  envId: string;
  models: common.FileModel[];
  vizs: common.FileChart[];
}) {
  let { structId, orgId, projectId, models, vizs, envId } = item;

  let apiVizs: common.Viz[] = [];
  let vizMconfigs: common.Mconfig[] = [];
  let vizQueries: common.Query[] = [];

  vizs.forEach(x => {
    let { apiTiles, mconfigs, queries } = wrapTiles({
      orgId: orgId,
      projectId: projectId,
      structId: structId,
      models: models,
      tiles: x.tiles,
      envId: envId
    });

    vizMconfigs = [...vizMconfigs, ...mconfigs];
    vizQueries = [...vizQueries, ...queries];

    let model = models.find(m => m.name === x.tiles[0].model);

    apiVizs.push({
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
    apiVizs: apiVizs,
    vizMconfigs: vizMconfigs,
    vizQueries: vizQueries
  };
}
