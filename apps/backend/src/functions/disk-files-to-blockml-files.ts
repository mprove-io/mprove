import type { BmlFile } from '#common/zod/blockml/bml-file';
import type { DiskCatalogFile } from '#common/zod/disk/disk-catalog-file';

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
