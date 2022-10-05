import { common } from '~disk/barrels/common';

export interface ItemCatalog {
  files: common.DiskCatalogFile[];

  nodes: common.DiskCatalogNode[];

  mproveDir: string;
}
