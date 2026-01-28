import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { ConnectionOptions } from './connection-parts/connection-options';

export class ProjectConnection {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  connectionId?: string;

  @IsOptional()
  @IsString()
  envId?: string;

  @IsOptional()
  @IsEnum(ConnectionTypeEnum)
  type?: ConnectionTypeEnum;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionOptions)
  options: ConnectionOptions;

  @IsOptional()
  @IsInt()
  serverTs?: number;
}
