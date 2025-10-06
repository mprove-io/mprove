import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
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
  filePath: string;

  content: any;

  @IsString({ each: true })
  accessRoles: string[];

  @IsString()
  title: string;

  @ValidateNested()
  @Type(() => DashboardField)
  fields: DashboardField[];

  @ValidateNested()
  @Type(() => Tile)
  tiles: Tile[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  serverTs: number;
}
