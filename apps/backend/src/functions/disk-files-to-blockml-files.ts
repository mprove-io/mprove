import type { BmlFile } from '#common/types/blockml/parts/bml-file';
import type { DiskCatalogFile } from '#common/types/disk/parts/disk-catalog-file';

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
