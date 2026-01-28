import { ModelDef as MalloyModelDef } from '@malloydata/malloy';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { FileStore } from './internal/file-store';
import { ModelField } from './model-field';
import { ModelNode } from './model-node';

export class Model {
  @IsString()
  structId: string;

  @IsString()
  modelId: string;

  @IsEnum(ModelTypeEnum)
  type: ModelTypeEnum;

  @IsOptional()
  @IsString()
  source: string;

  @IsString()
  connectionId: string;

  @IsEnum(ConnectionTypeEnum)
  connectionType: ConnectionTypeEnum;

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

  malloyModelDef: MalloyModelDef;

  @IsInt()
  serverTs: number;
}
