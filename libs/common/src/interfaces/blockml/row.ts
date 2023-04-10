import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { enums } from '~common/barrels/enums';
import { MconfigX } from '../backend/mconfig-x';
import { Filter } from './filter';
import { Parameter } from './parameter';
import { Query } from './query';
import { Rc } from './rc';
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
  isParamsCalcValid?: boolean;

  @IsBoolean()
  isParamsJsonValid?: boolean;

  @IsBoolean()
  isParamsSchemaValid?: boolean;

  @IsString()
  paramsSchemaError?: string;

  @ValidateNested()
  @Type(() => Filter)
  paramsFiltersWithExcludedTime?: Filter[];

  @ValidateNested()
  @Type(() => Parameter)
  parametersJson: Parameter[];

  @ValidateNested()
  @Type(() => Parameter)
  parameters: Parameter[];

  @IsString()
  parametersFormula: string;

  parametersFormulaDeps: string[];

  @IsBoolean()
  hasAccessToModel: boolean;

  @ValidateNested()
  @Type(() => MconfigX)
  mconfig: MconfigX;

  @ValidateNested()
  @Type(() => Query)
  query: Query;

  formula: string;

  formulaDeps: string[];

  showChart: boolean;

  @ValidateNested()
  @Type(() => Rc)
  rcs: Rc[];

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
