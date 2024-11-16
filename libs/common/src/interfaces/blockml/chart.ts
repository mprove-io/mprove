import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { Tile } from './tile';

export class Chart {
  @IsString()
  structId: string;

  @IsString()
  chartId: string;

  @IsString()
  title: string;

  @IsString()
  modelId: string;

  @IsString()
  modelLabel: string;

  @IsString()
  filePath: string;

  @IsString({ each: true })
  accessUsers: string[];

  @IsString({ each: true })
  accessRoles: string[];

  @IsOptional()
  @IsString()
  gr?: string;

  @IsBoolean()
  hidden: boolean;

  @ValidateNested()
  @Type(() => Tile)
  tiles: Tile[];

  @IsInt()
  serverTs: number;
}
