import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { enums } from '~api/barrels/enums';

export class Fraction {
  @IsString()
  brick: string;

  @IsEnum(enums.FractionOperatorEnum)
  operator: enums.FractionOperatorEnum;

  @IsEnum(enums.FractionTypeEnum)
  type: enums.FractionTypeEnum;

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
}
