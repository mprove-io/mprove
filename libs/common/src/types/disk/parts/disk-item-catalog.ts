import type { DiskCatalogFile } from '#common/types/disk/parts/disk-catalog-file';
import type { DiskCatalogNode } from '#common/types/disk/parts/disk-catalog-node';

export type DiskItemCatalog = {
  files: DiskCatalogFile[];
  nodes: DiskCatalogNode[];
  mproveDir: string;
};
