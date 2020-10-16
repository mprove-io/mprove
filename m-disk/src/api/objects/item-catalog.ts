import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CatalogItemFile } from './catalog-item-file';
import { CatalogNode } from './catalog-node';

export class ItemCatalog {
  @ValidateNested()
  @Type(() => CatalogItemFile)
  files: CatalogItemFile[];

  @ValidateNested()
  @Type(() => CatalogNode)
  nodes: CatalogNode[];
}
