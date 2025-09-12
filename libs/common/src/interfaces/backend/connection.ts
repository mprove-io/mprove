import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { ConnectionHeader } from './connection-header';

export class Connection {
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
  @IsString()
  googleCloudProject?: string;

  @IsOptional()
  @IsString()
  googleCloudClientEmail?: string;

  @IsOptional()
  @IsInt()
  bigqueryQuerySizeLimitGb?: number;

  @IsOptional()
  @IsString()
  account?: string;

  @IsOptional()
  @IsString()
  warehouse?: string;

  @IsOptional()
  @IsString()
  baseUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionHeader)
  headers?: ConnectionHeader[];

  @IsOptional()
  @IsString({ each: true })
  googleAuthScopes?: string[];

  @IsOptional()
  @IsString()
  host?: string;

  @IsOptional()
  @IsInt()
  port?: number;

  @IsOptional()
  @IsString()
  database?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsBoolean()
  isSSL?: boolean;

  @IsOptional()
  @IsInt()
  serverTs?: number;
}
