import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';

export class DiskCatalogNode {
  @IsString()
  id: string;
  // "p1/ec/s.store"

  @IsBoolean()
  isFolder: boolean;
  // true

  @IsString()
  name: string;
  // s.store"

  @IsString()
  fileId?: string;
  // "ec___s.store"

  @ValidateNested()
  @Type(() => DiskCatalogNode)
  children?: DiskCatalogNode[];
}
