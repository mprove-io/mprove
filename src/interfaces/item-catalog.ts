import { api } from '../barrels/api';
import { entities } from '../barrels/entities';

export interface ItemCatalog {
  files: entities.FileEntity[];
  nodes: api.CatalogNode[];
}
