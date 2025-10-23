import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { RowTypeEnum } from '~common/enums/row-type.enum';
import { MconfigX } from '../backend/mconfig-x';
import { Filter } from './filter';
import { Parameter } from './parameter';
import { Query } from './query';
import { RowRecord } from './row-record';
import { Rq } from './rq';

export class Row {
  @IsString()
  rowId: string;

  @IsString()
  name: string;

  @IsEnum(RowTypeEnum)
  rowType: RowTypeEnum;

  @IsString()
  metricId: string;

  @IsString()
  modelId: string;

  @IsString()
  topLabel: string;

  @IsString()
  partNodeLabel: string;

  @IsString()
  partFieldLabel: string;

  @IsString()
  partLabel: string;

  @IsString()
  timeNodeLabel: string;

  @IsString()
  timeFieldLabel: string;

  @IsString()
  timeLabel: string;

  @IsString()
  formulaError?: string;

  @IsString()
  topQueryError?: string;

  @IsBoolean()
  hasAccessToModel: boolean;

  @ValidateNested()
  @Type(() => MconfigX)
  mconfig: MconfigX;

  @ValidateNested()
  @Type(() => Query)
  query: Query;

  showChart: boolean;

  @ValidateNested()
  @Type(() => Rq)
  rqs: Rq[];

  records: RowRecord[];

  @IsString()
  formatNumber: string;

  @IsString()
  currencyPrefix: string;

  @IsString()
  currencySuffix: string;

  @ValidateNested()
  @Type(() => Parameter)
  parameters: Parameter[];

  @ValidateNested()
  @Type(() => Filter)
  parametersFiltersWithExcludedTime: Filter[];

  formula: string;

  formulaDeps: string[];

  deps: string[];
}
