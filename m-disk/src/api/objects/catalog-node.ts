import { IsString } from 'class-validator';

export class CatalogNode {
  @IsString()
  id: string;
  // "p1/ec/s.view"

  @IsString()
  isFolder: boolean;
  // true

  @IsString()
  name: string;
  // s.view"

  @IsString()
  fileId?: string;
  // "ec___s.view"

  @IsString()
  children?: CatalogNode[];
}
