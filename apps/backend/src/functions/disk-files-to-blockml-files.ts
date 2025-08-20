import { BmlFile } from '~common/interfaces/blockml/bml-file';
import { DiskCatalogFile } from '~common/interfaces/disk/disk-catalog-file';

export function diskFilesToBlockmlFiles(diskFiles: DiskCatalogFile[]) {
  return diskFiles.map(x => {
    let blockmlFile: BmlFile = {
      content: x.content,
      name: x.name,
      path: x.fileNodeId
    };
    return blockmlFile;
  });
}
