import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { ConnectionTab } from './connection/connection-tab';

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
  @Type(() => ConnectionTab)
  tab?: ConnectionTab;

  @IsOptional()
  @IsInt()
  serverTs?: number;
}
