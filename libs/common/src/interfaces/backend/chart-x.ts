import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
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

  @IsEnum(ChartTypeEnum)
  chartType: ChartTypeEnum;

  iconPath?: string;
}
