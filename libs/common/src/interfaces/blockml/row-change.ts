import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { RowTypeEnum } from '#common/enums/row-type.enum';
import { Parameter } from './parameter';

export class RowChange {
  @IsOptional()
  @IsString()
  rowId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(RowTypeEnum)
  rowType?: RowTypeEnum;

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
