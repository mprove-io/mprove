import { apiToDisk } from '~disk/barrels/api';

export interface ItemCatalog {
  files: apiToDisk.DiskCatalogFile[];

  nodes: apiToDisk.DiskCatalogNode[];
}
