import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { enums } from '~common/barrels/enums';
import { MconfigX } from '../backend/mconfig-x';
import { Filter } from './filter';
import { Parameter } from './parameter';
import { Query } from './query';
import { Rq } from './rq';

export class Row {
  @IsString()
  rowId: string;

  @IsString()
  name: string;

  @IsEnum(enums.RowTypeEnum)
  rowType: enums.RowTypeEnum;

  @IsString()
  metricId: string;

  @IsString()
  topLabel: string;

  @IsString()
  partLabel: string;

  @IsString()
  timeLabel: string;

  @IsBoolean()
  isParamsJsonValid?: boolean;

  @IsBoolean()
  isParamsSchemaValid?: boolean;

  @IsString()
  paramsSchemaError?: string;

  parametersJson: any[];

  @ValidateNested()
  @Type(() => Parameter)
  parameters: Parameter[];

  @IsBoolean()
  isCalculateParameters: boolean;

  @ValidateNested()
  @Type(() => Filter)
  parametersFiltersWithExcludedTime: Filter[];

  @IsString()
  parametersFormula: string;

  xDeps: string[];

  deps: string[];

  @IsBoolean()
  hasAccessToModel: boolean;

  @ValidateNested()
  @Type(() => MconfigX)
  mconfig: MconfigX;

  @ValidateNested()
  @Type(() => Query)
  query: Query;

  formula: string;

  showChart: boolean;

  @ValidateNested()
  @Type(() => Rq)
  rqs: Rq[];

  records: any[];

  @IsString()
  formatNumber: string;

  @IsString()
  currencyPrefix: string;

  @IsString()
  currencySuffix: string;
}
