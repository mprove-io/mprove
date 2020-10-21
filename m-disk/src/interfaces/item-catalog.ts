import * as apiObjects from '../api/objects/_index';

export interface ItemCatalog {
  files: apiObjects.DiskCatalogFile[];

  nodes: apiObjects.DiskCatalogNode[];
}
