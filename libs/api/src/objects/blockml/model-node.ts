import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import * as apiEnums from '~/enums/_index';

export class ModelNode {
  @IsString()
  id: string; // uses ModelNodeIdSuffixEnum

  @IsString()
  label: string; // ModelNodeLabelEnum or join name

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(apiEnums.FieldClassEnum)
  nodeClass: apiEnums.FieldClassEnum;

  @IsOptional()
  @IsString()
  viewName?: string;

  @IsBoolean()
  isField: boolean;

  @IsOptional()
  @IsString()
  fieldFileName?: string;

  @IsOptional()
  @IsInt()
  fieldLineNum?: number;

  @IsBoolean()
  hidden: boolean;

  @ValidateNested()
  @Type(() => ModelNode)
  children?: ModelNode[];
}
