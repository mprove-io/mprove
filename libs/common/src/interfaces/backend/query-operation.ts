import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { enums } from '~common/barrels/enums';
import { Filter } from '../_index';

export class QueryOperation {
  @IsEnum(enums.QueryOperationTypeEnum)
  type: enums.QueryOperationTypeEnum;

  @IsString()
  timezone: string;

  @IsOptional()
  @IsInt()
  limit?: number;

  @IsOptional()
  @IsString()
  fieldId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Filter)
  filters?: Filter[];

  @IsOptional()
  @IsString()
  sortFieldId?: string;

  @IsOptional()
  @IsBoolean()
  desc?: boolean;

  @IsOptional()
  @IsString()
  replaceWithFieldId?: string;

  @IsOptional()
  @IsString({ each: true })
  moveFieldIds?: string[];
}
