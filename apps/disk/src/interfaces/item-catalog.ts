import { api } from '~disk/barrels/api';

export interface ItemCatalog {
  files: api.DiskCatalogFile[];

  nodes: api.DiskCatalogNode[];
}
