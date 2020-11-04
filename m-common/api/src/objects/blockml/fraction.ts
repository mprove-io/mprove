import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import * as apiEnums from '../../enums/_index';

export class Fraction {
  @IsString()
  brick: string;

  @IsEnum(apiEnums.FractionOperatorEnum)
  operator: apiEnums.FractionOperatorEnum;

  @IsEnum(apiEnums.FractionTypeEnum)
  type: apiEnums.FractionTypeEnum;

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
  @IsEnum(apiEnums.FractionNumberBetweenOptionEnum)
  numberBetweenOption?: apiEnums.FractionNumberBetweenOptionEnum;

  @IsOptional()
  @IsEnum(apiEnums.FractionYesnoValueEnum)
  yesnoValue?: apiEnums.FractionYesnoValueEnum;

  @IsOptional()
  @IsEnum(apiEnums.FractionDayOfWeekValueEnum)
  dayOfWeekValue?: apiEnums.FractionDayOfWeekValueEnum;

  @IsOptional()
  @IsString()
  dayOfWeekIndexValues?: string;

  @IsOptional()
  @IsEnum(apiEnums.FractionMonthNameValueEnum)
  monthNameValue?: apiEnums.FractionMonthNameValueEnum;

  @IsOptional()
  @IsEnum(apiEnums.FractionQuarterOfYearValueEnum)
  quarterOfYearValue?: apiEnums.FractionQuarterOfYearValueEnum;

  @IsOptional()
  @IsNumber()
  tsDateYear?: number;

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
  @IsEnum(apiEnums.FractionTsRelativeUnitEnum)
  tsRelativeUnit?: apiEnums.FractionTsRelativeUnitEnum;

  @IsOptional()
  @IsEnum(apiEnums.FractionTsRelativeCompleteOptionEnum)
  tsRelativeCompleteOption?: apiEnums.FractionTsRelativeCompleteOptionEnum;

  @IsOptional()
  @IsEnum(apiEnums.FractionTsRelativeWhenOptionEnum)
  tsRelativeWhenOption?: apiEnums.FractionTsRelativeWhenOptionEnum;

  @IsOptional()
  @IsEnum(apiEnums.FractionTsForOptionEnum)
  tsForOption?: apiEnums.FractionTsForOptionEnum;

  @IsOptional()
  @IsNumber()
  tsForValue?: number;

  @IsOptional()
  @IsEnum(apiEnums.FractionTsForUnitEnum)
  tsForUnit?: apiEnums.FractionTsForUnitEnum;

  @IsOptional()
  @IsNumber()
  tsLastValue?: number;

  @IsOptional()
  @IsEnum(apiEnums.FractionTsLastUnitEnum)
  tsLastUnit?: apiEnums.FractionTsLastUnitEnum;

  @IsOptional()
  @IsEnum(apiEnums.FractionTsLastCompleteOptionEnum)
  tsLastCompleteOption?: apiEnums.FractionTsLastCompleteOptionEnum;
}
