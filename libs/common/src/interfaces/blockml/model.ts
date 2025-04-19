import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { ModelField } from './model-field';
import { ModelNode } from './model-node';

export class Model {
  @IsString()
  structId: string;

  @IsString()
  modelId: string;

  @IsString()
  connectionId: string;

  @IsString()
  filePath: string;

  content: any;

  @IsBoolean()
  isViewModel: boolean;

  @IsBoolean()
  isStoreModel: boolean;

  @IsBoolean()
  dateRangeIncludesRightSide: boolean;

  @IsString({ each: true })
  accessRoles: string[];

  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  gr?: string;

  @IsBoolean()
  hidden: boolean;

  @ValidateNested()
  @Type(() => ModelField)
  fields: ModelField[];

  @ValidateNested()
  @Type(() => ModelNode)
  nodes: ModelNode[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  serverTs: number;
}
