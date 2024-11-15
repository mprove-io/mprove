import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Chart } from '../blockml/chart';
import { TileX } from './tile-x';

export class ChartX extends Chart {
  @ValidateNested()
  @Type(() => TileX)
  tiles: TileX[];

  @IsString()
  author: string;

  @IsBoolean()
  canEditOrDeleteChart: boolean;
}
