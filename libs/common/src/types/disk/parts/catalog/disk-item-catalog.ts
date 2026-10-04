import type { DiskCatalogFile } from '#common/types/disk/parts/catalog/disk-catalog-file';
import type { DiskCatalogNode } from '#common/types/disk/parts/catalog/disk-catalog-node';

export type DiskItemCatalog = {
  files: DiskCatalogFile[];
  nodes: DiskCatalogNode[];
  mproveDir: string;
};
