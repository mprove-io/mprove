import { DiskCatalogFile } from '~common/interfaces/disk/disk-catalog-file';
import { DiskCatalogNode } from '~common/interfaces/disk/disk-catalog-node';

export interface ItemCatalog {
  files: DiskCatalogFile[];
  nodes: DiskCatalogNode[];
  mproveDir: string;
}
