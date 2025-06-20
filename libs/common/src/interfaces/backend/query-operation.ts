import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString
} from 'class-validator';
import { enums } from '~common/barrels/enums';

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
