import { Moment } from '@malloydata/malloy-filter';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { enums } from '~common/barrels/enums';
import { FractionControl } from './fraction-control';
import { FractionSubTypeOption } from './fraction-sub-type-option';

export class Fraction {
  @IsOptional()
  @ValidateNested()
  @Type(() => FractionControl)
  controls?: FractionControl[];

  //

  @IsOptional()
  @IsString()
  brick: string;

  @IsOptional()
  @IsString()
  parentBrick?: string;

  @IsOptional()
  @IsEnum(enums.FractionOperatorEnum)
  operator: enums.FractionOperatorEnum;

  @IsOptional()
  @IsEnum(enums.FractionLogicEnum)
  logicGroup?: enums.FractionLogicEnum;

  @IsEnum(enums.FractionTypeEnum)
  type: enums.FractionTypeEnum;

  @IsOptional()
  @ValidateNested()
  @Type(() => FractionSubTypeOption)
  storeFractionSubTypeOptions?: FractionSubTypeOption[];

  @IsOptional()
  @IsString()
  storeFractionSubType?: string;

  @IsOptional()
  @IsString()
  storeFractionSubTypeLabel?: string;

  @IsOptional()
  @IsString()
  storeFractionLogicGroupWithSubType?: string;

  @IsOptional()
  meta?: any;

  @IsOptional()
  @IsString()
  storeResult?: string;

  @IsOptional()
  @IsString()
  stringValue?: string;

  @IsOptional()
  @IsNumber()
  numberValue1?: number;

  @IsOptional()
  @IsNumber()
  numberValue2?: number;

  @IsOptional()
  @IsString()
  numberValues?: string;

  @IsOptional()
  @IsEnum(enums.FractionNumberBetweenOptionEnum)
  numberBetweenOption?: enums.FractionNumberBetweenOptionEnum;

  @IsOptional()
  @IsEnum(enums.FractionYesnoValueEnum)
  yesnoValue?: enums.FractionYesnoValueEnum;

  @IsOptional()
  @IsEnum(enums.FractionDayOfWeekValueEnum)
  dayOfWeekValue?: enums.FractionDayOfWeekValueEnum;

  @IsOptional()
  @IsString()
  dayOfWeekIndexValues?: string;

  @IsOptional()
  @IsEnum(enums.FractionMonthNameValueEnum)
  monthNameValue?: enums.FractionMonthNameValueEnum;

  @IsOptional()
  @IsEnum(enums.FractionQuarterOfYearValueEnum)
  quarterOfYearValue?: enums.FractionQuarterOfYearValueEnum;

  @IsOptional()
  @IsNumber()
  tsDateYear?: number;

  @IsOptional()
  @IsNumber()
  tsDateQuarter?: number;

  @IsOptional()
  @IsNumber()
  tsDateMonth?: number;

  @IsOptional()
  @IsNumber()
  tsDateDay?: number;

  @IsOptional()
  @IsNumber()
  tsDateHour?: number;

  @IsOptional()
  @IsNumber()
  tsDateMinute?: number;

  @IsOptional()
  @IsNumber()
  tsDateToYear?: number;

  @IsOptional()
  @IsNumber()
  tsDateToQuarter?: number;

  @IsOptional()
  @IsNumber()
  tsDateToMonth?: number;

  @IsOptional()
  @IsNumber()
  tsDateToDay?: number;

  @IsOptional()
  @IsNumber()
  tsDateToHour?: number;

  @IsOptional()
  @IsNumber()
  tsDateToMinute?: number;

  @IsOptional()
  @IsNumber()
  tsRelativeValue?: number;

  @IsOptional()
  @IsEnum(enums.FractionTsRelativeUnitEnum)
  tsRelativeUnit?: enums.FractionTsRelativeUnitEnum;

  @IsOptional()
  @IsEnum(enums.FractionTsRelativeCompleteOptionEnum)
  tsRelativeCompleteOption?: enums.FractionTsRelativeCompleteOptionEnum;

  @IsOptional()
  @IsEnum(enums.FractionTsRelativeWhenOptionEnum)
  tsRelativeWhenOption?: enums.FractionTsRelativeWhenOptionEnum;

  @IsOptional()
  @IsEnum(enums.FractionTsForOptionEnum)
  tsForOption?: enums.FractionTsForOptionEnum;

  @IsOptional()
  @IsNumber()
  tsForValue?: number;

  @IsOptional()
  @IsEnum(enums.FractionTsForUnitEnum)
  tsForUnit?: enums.FractionTsForUnitEnum;

  @IsOptional()
  @IsNumber()
  tsLastValue?: number;

  @IsOptional()
  @IsEnum(enums.FractionTsLastUnitEnum)
  tsLastUnit?: enums.FractionTsLastUnitEnum;

  @IsOptional()
  @IsEnum(enums.FractionTsLastCompleteOptionEnum)
  tsLastCompleteOption?: enums.FractionTsLastCompleteOptionEnum;

  @IsOptional()
  @IsNumber()
  tsNextValue?: number;

  @IsOptional()
  @IsEnum(enums.FractionTsNextUnitEnum)
  tsNextUnit?: enums.FractionTsNextUnitEnum;

  @IsOptional()
  @IsEnum(enums.FractionTsMomentTypeEnum)
  tsMomentType?: enums.FractionTsMomentTypeEnum;

  @IsOptional()
  @IsEnum(enums.FractionTsMomentTypeEnum)
  tsFromMomentType?: enums.FractionTsMomentTypeEnum;

  @IsOptional()
  @IsEnum(enums.FractionTsMomentTypeEnum)
  tsToMomentType?: enums.FractionTsMomentTypeEnum;

  @IsOptional()
  tsMoment?: Moment;

  @IsOptional()
  tsFromMoment?: Moment;

  @IsOptional()
  tsToMoment?: Moment;
}
