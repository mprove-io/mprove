import { apiToDisk } from '~disk/barrels/api-to-disk';

export interface ItemCatalog {
  files: apiToDisk.DiskCatalogFile[];

  nodes: apiToDisk.DiskCatalogNode[];
}
