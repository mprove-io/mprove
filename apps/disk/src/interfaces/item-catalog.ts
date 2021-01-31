import { api } from '~/barrels/api';

export interface ItemCatalog {
  files: api.DiskCatalogFile[];

  nodes: api.DiskCatalogNode[];
}
