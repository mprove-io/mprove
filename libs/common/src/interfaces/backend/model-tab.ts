import { ModelDef as MalloyModelDef } from '@malloydata/malloy';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { FileStore } from '../blockml/internal/file-store';
import { ModelField } from '../blockml/model-field';
import { ModelNode } from '../blockml/model-node';

export class ModelTab {
  @IsOptional()
  @IsString()
  source: string;

  malloyModelDef: MalloyModelDef;

  @IsString()
  filePath: string;

  @IsString()
  fileText: string;

  storeContent: FileStore;

  @IsBoolean()
  dateRangeIncludesRightSide: boolean;

  @IsString({ each: true })
  accessRoles: string[];

  @IsString()
  label: string;

  @ValidateNested()
  @Type(() => ModelField)
  fields: ModelField[];

  @ValidateNested()
  @Type(() => ModelNode)
  nodes: ModelNode[];
}
