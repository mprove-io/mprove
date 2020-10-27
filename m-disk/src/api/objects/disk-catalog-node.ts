import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';

export class DiskCatalogNode {
  @IsString()
  id: string;
  // "p1/ec/s.view"

  @IsBoolean()
  isFolder: boolean;
  // true

  @IsString()
  name: string;
  // s.view"

  @IsString()
  fileId?: string;
  // "ec___s.view"

  @ValidateNested()
  @Type(() => DiskCatalogNode)
  children?: DiskCatalogNode[];
}
