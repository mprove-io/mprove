import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { enums } from '~common/barrels/enums';
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

  @IsEnum(enums.ChartTypeEnum)
  chartType: enums.ChartTypeEnum;

  iconPath?: string;
}
