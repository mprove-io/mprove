import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { DashboardField } from '../blockml/dashboard-field';
import { Tile } from '../blockml/tile';

export class DashboardTab {
  @IsString()
  title: string;

  @IsString()
  filePath: string;

  content: any;

  @IsString({ each: true })
  accessRoles: string[];

  @ValidateNested()
  @Type(() => DashboardField)
  fields: DashboardField[];

  @ValidateNested()
  @Type(() => Tile)
  tiles: Tile[];
}
