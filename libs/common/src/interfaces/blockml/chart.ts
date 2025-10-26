import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsString, ValidateNested } from 'class-validator';
import { Tile } from './tile';

export class Chart {
  @IsString()
  structId: string;

  @IsString()
  chartId: string;

  @IsBoolean()
  draft: boolean;

  @IsString()
  creatorId: string;

  @IsString()
  title: string;

  @IsString()
  modelId: string;

  @IsString()
  modelLabel: string;

  @IsString()
  filePath: string;

  @ValidateNested()
  @Type(() => Tile)
  tiles: Tile[];

  @IsInt()
  serverTs: number;
}
