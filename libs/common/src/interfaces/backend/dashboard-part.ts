import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Tile } from '../blockml/tile';

export class DashboardPart {
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
  tiles: Tile[]; // for mcli

  //

  @IsString()
  author: string;

  @IsBoolean()
  canEditOrDeleteDashboard: boolean;
}
