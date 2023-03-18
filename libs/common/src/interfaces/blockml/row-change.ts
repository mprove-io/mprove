import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { enums } from '~common/barrels/enums';
import { Parameter } from './parameter';

export class RowChange {
  @IsOptional()
  @IsString()
  rowId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(enums.RowTypeEnum)
  rowType?: enums.RowTypeEnum;

  @IsOptional()
  @IsString()
  metricId?: string;

  @IsOptional()
  @IsString()
  formula?: string;

  @IsOptional()
  @IsBoolean()
  showChart?: boolean;

  @IsOptional()
  parameters?: Parameter[];

  @IsOptional()
  @IsString()
  formatNumber?: string;

  @IsOptional()
  @IsString()
  currencyPrefix?: string;

  @IsOptional()
  @IsString()
  currencySuffix?: string;
}
