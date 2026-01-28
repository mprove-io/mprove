import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';

export class ModelNode {
  @IsString()
  id: string; // uses ModelNodeIdSuffixEnum

  @IsString()
  label: string; // ModelNodeLabelEnum or join name

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(FieldClassEnum)
  nodeClass: FieldClassEnum;

  @IsOptional()
  @IsString()
  viewName?: string;

  @IsBoolean()
  isField: boolean;

  @IsOptional()
  @IsString()
  fieldFileName?: string;

  @IsOptional()
  @IsString()
  viewFilePath?: string;

  @IsOptional()
  @IsString()
  fieldFilePath?: string;

  @IsOptional()
  @IsEnum(FieldResultEnum)
  fieldResult?: FieldResultEnum;

  @IsOptional()
  @IsInt()
  fieldLineNum?: number;

  @IsBoolean()
  hidden: boolean;

  @IsBoolean()
  required: boolean;

  @ValidateNested()
  @Type(() => ModelNode)
  children?: ModelNode[];
}
