import { BmlFile } from '~common/interfaces/blockml/bml-file';
import { FileMod } from '~common/interfaces/blockml/internal/file-mod';
import { FilePartTile } from '~common/interfaces/blockml/internal/file-part-tile';
import { Model } from '~common/interfaces/blockml/model';

export function getTileApiModel(item: {
  tile: FilePartTile;
  filePath: string;
  mods: FileMod[];
  apiModels: Model[];
  malloyFiles: BmlFile[];
}) {
  let { tile, filePath } = item;

  let apiModel: Model;

  // if (isDefined(tile.query)) {
  //   let malloyFile = item.malloyFiles.find(
  //     file =>
  //       file.path ===
  //       filePath.substring(0, filePath.lastIndexOf('.')) + '.malloy'
  //   );

  //   if (isUndefined(malloyFile)) {
  //     return undefined; // TODO: check
  //   }

  //   let source: string;

  //   let reg = MyRegex.MALLOY_QUERY_SOURCE(tile.query);
  //   let r;

  //   if ((r = reg.exec(malloyFile.content))) {
  //     source = r[2];
  //   }

  //   let mod = item.mods.find(x => x.source === source);

  //   apiModel = item.apiModels.find(y => y.modelId === mod.name);
  // } else {
  apiModel = item.apiModels.find(y => y.modelId === tile.model);
  // }

  return apiModel;
}
