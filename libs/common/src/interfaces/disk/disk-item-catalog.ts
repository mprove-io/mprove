import { DiskCatalogFile } from '#common/interfaces/disk/disk-catalog-file';
import { DiskCatalogNode } from '#common/interfaces/disk/disk-catalog-node';

export interface DiskItemCatalog {
  files: DiskCatalogFile[];
  nodes: DiskCatalogNode[];
  mproveDir: string;
}
