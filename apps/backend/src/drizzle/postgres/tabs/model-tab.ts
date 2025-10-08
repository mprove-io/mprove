import { ModelDef as MalloyModelDef } from '@malloydata/malloy';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { FileStore } from '~common/interfaces/blockml/internal/file-store';
import { ModelField } from '~common/interfaces/blockml/model-field';
import { ModelNode } from '~common/interfaces/blockml/model-node';
import { ModelEnt } from '../schema/models';

export interface ModelTab extends Omit<ModelEnt, 'st' | 'lt'> {
  st: ModelSt;
  lt: ModelLt;
}

export class ModelSt {
  @IsString({ each: true })
  accessRoles: string[];
}

export class ModelLt {
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

  @IsString()
  label: string;

  @ValidateNested()
  @Type(() => ModelField)
  fields: ModelField[];

  @ValidateNested()
  @Type(() => ModelNode)
  nodes: ModelNode[];
}
