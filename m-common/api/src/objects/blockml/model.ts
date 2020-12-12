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
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  structId: string;

  @IsString()
  modelId: string;

  content: any;

  @IsString({ each: true })
  accessUsers: string[];

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
