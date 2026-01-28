import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { QueryOperationTypeEnum } from '#common/enums/query-operation-type.enum';
import { Filter } from '../blockml/filter';

export class QueryOperation {
  @IsEnum(QueryOperationTypeEnum)
  type: QueryOperationTypeEnum;

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
