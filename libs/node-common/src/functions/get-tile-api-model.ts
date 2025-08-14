import { common } from '~node-common/barrels/common';

export function getTileApiModel(item: {
  tile: common.FilePartTile;
  filePath: string;
  mods: common.FileMod[];
  apiModels: common.Model[];
  malloyFiles: common.BmlFile[];
}) {
  let { tile, filePath } = item;

  let apiModel: common.Model;

  if (common.isDefined(tile.query)) {
    let malloyFile = item.malloyFiles.find(
      file =>
        file.path ===
        filePath.substring(0, filePath.lastIndexOf('.')) + '.malloy'
    );

    if (common.isUndefined(malloyFile)) {
      return undefined; // TODO: check
    }

    let source: string;

    let reg = common.MyRegex.MALLOY_QUERY_SOURCE(tile.query);
    let r;

    if ((r = reg.exec(malloyFile.content))) {
      source = r[2];
    }

    let mod = item.mods.find(x => x.source === source);

    apiModel = item.apiModels.find(y => y.modelId === mod.name);
  } else {
    apiModel = item.apiModels.find(y => y.modelId === tile.model);
  }

  return apiModel;
}
