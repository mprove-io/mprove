import { common } from '~backend/barrels/common';

export function diskFilesToBlockmlFiles(diskFiles: common.DiskCatalogFile[]) {
  return diskFiles.map(x => {
    let blockmlFile: common.BmlFile = {
      content: x.content,
      name: x.name,
      path: x.fileNodeId
    };
    return blockmlFile;
  });
}
