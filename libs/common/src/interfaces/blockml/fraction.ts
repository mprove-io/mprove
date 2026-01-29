import type { Moment } from '@malloydata/malloy-filter';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { FractionDayOfWeekValueEnum } from '#common/enums/fraction/fraction-day-of-week-value.enum';
import { FractionLogicEnum } from '#common/enums/fraction/fraction-logic.enum';
import { FractionMonthNameValueEnum } from '#common/enums/fraction/fraction-month-name-value.enum';
import { FractionNumberBetweenOptionEnum } from '#common/enums/fraction/fraction-number-between-option.enum';
import { FractionOperatorEnum } from '#common/enums/fraction/fraction-operator.enum';
import { FractionQuarterOfYearValueEnum } from '#common/enums/fraction/fraction-quarter-of-year-value.enum';
import { FractionTsLastCompleteOptionEnum } from '#common/enums/fraction/fraction-ts-last-complete-option.enum';
import { FractionTsMixUnitEnum } from '#common/enums/fraction/fraction-ts-mix-unit.enum';
import { FractionTsMomentTypeEnum } from '#common/enums/fraction/fraction-ts-moment-type.enum';
import { FractionTsUnitEnum } from '#common/enums/fraction/fraction-ts-unit.enum';
import { FractionTypeEnum } from '#common/enums/fraction/fraction-type.enum';
import { FractionYesnoValueEnum } from '#common/enums/fraction/fraction-yesno-value.enum';
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
  parentBrick: string;

  @IsOptional()
  @IsEnum(FractionOperatorEnum)
  operator: FractionOperatorEnum;

  @IsOptional()
  @IsEnum(FractionLogicEnum)
  logicGroup?: FractionLogicEnum;

  @IsEnum(FractionTypeEnum)
  type: FractionTypeEnum;

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
  @IsEnum(FractionNumberBetweenOptionEnum)
  numberBetweenOption?: FractionNumberBetweenOptionEnum;

  @IsOptional()
  @IsEnum(FractionYesnoValueEnum)
  yesnoValue?: FractionYesnoValueEnum;

  @IsOptional()
  @IsEnum(FractionDayOfWeekValueEnum)
  dayOfWeekValue?: FractionDayOfWeekValueEnum;

  @IsOptional()
  @IsString()
  dayOfWeekIndexValues?: string;

  @IsOptional()
  @IsEnum(FractionMonthNameValueEnum)
  monthNameValue?: FractionMonthNameValueEnum;

  @IsOptional()
  @IsEnum(FractionQuarterOfYearValueEnum)
  quarterOfYearValue?: FractionQuarterOfYearValueEnum;

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
  tsForValue?: number;

  @IsOptional()
  @IsEnum(FractionTsUnitEnum)
  tsForUnit?: FractionTsUnitEnum;

  @IsOptional()
  @IsNumber()
  tsLastValue?: number;

  @IsOptional()
  @IsEnum(FractionTsUnitEnum)
  tsLastUnit?: FractionTsUnitEnum;

  @IsOptional()
  @IsEnum(FractionTsLastCompleteOptionEnum)
  tsLastCompleteOption?: FractionTsLastCompleteOptionEnum;

  @IsOptional()
  @IsNumber()
  tsNextValue?: number;

  @IsOptional()
  @IsEnum(FractionTsUnitEnum)
  tsNextUnit?: FractionTsUnitEnum;

  //

  @IsOptional()
  tsMoment?: Moment;

  @IsOptional()
  @IsEnum(FractionTsMomentTypeEnum)
  tsMomentType?: FractionTsMomentTypeEnum;

  @IsOptional()
  @IsEnum(FractionTsMixUnitEnum)
  tsMomentUnit?: FractionTsMixUnitEnum;

  @IsOptional()
  @IsString()
  tsTimestampValue?: string;

  @IsOptional()
  @IsNumber()
  tsMomentAgoFromNowQuantity?: number;

  //

  @IsOptional()
  tsFromMoment?: Moment;

  @IsOptional()
  @IsEnum(FractionTsMomentTypeEnum)
  tsFromMomentType?: FractionTsMomentTypeEnum;

  @IsOptional()
  @IsEnum(FractionTsMixUnitEnum)
  tsFromMomentUnit?: FractionTsMixUnitEnum;

  @IsOptional()
  @IsString()
  tsFromTimestampValue?: string;

  @IsOptional()
  @IsNumber()
  tsFromMomentAgoFromNowQuantity?: number;

  //

  @IsOptional()
  tsToMoment?: Moment;

  @IsOptional()
  @IsEnum(FractionTsMomentTypeEnum)
  tsToMomentType?: FractionTsMomentTypeEnum;

  @IsOptional()
  @IsEnum(FractionTsMixUnitEnum)
  tsToMomentUnit?: FractionTsMixUnitEnum;

  @IsOptional()
  @IsString()
  tsToTimestampValue?: string;

  @IsOptional()
  @IsNumber()
  tsToMomentAgoFromNowQuantity?: number;
}
