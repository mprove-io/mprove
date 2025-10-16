import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsString, ValidateNested } from 'class-validator';
import { DashboardField } from './dashboard-field';
import { Tile } from './tile';

export class Dashboard {
  @IsString()
  structId: string;

  @IsString()
  dashboardId: string;

  @IsBoolean()
  draft: boolean;

  @IsString()
  creatorId: string;

  @IsString()
  title: string;

  @IsString()
  filePath: string;

  @IsString({ each: true })
  accessRoles: string[];

  @ValidateNested()
  @Type(() => Tile)
  tiles: Tile[];

  @ValidateNested()
  @Type(() => DashboardField)
  fields: DashboardField[];

  content: any;

  @IsInt()
  serverTs: number;
}
