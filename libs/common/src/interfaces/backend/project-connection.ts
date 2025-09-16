import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { ConnectionBigqueryOptions } from './connection/connection-bigquery-options';
import { ConnectionClickhouseOptions } from './connection/connection-clickhouse-options';
import { ConnectionMotherduckOptions } from './connection/connection-motherduck-options';
import { ConnectionMysqlOptions } from './connection/connection-mysql-options';
import { ConnectionPostgresOptions } from './connection/connection-postgres-options';
import { ConnectionSnowflakeOptions } from './connection/connection-snowflake-options';
import { ConnectionStoreApiOptions } from './connection/connection-store-api-options';
import { ConnectionStoreGoogleApiOptions } from './connection/connection-store-google-api-options';

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
  @Type(() => ConnectionBigqueryOptions)
  bigqueryOptions?: ConnectionBigqueryOptions;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionClickhouseOptions)
  clickhouseOptions?: ConnectionClickhouseOptions;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionMotherduckOptions)
  motherduckOptions?: ConnectionMotherduckOptions;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionPostgresOptions)
  postgresOptions?: ConnectionPostgresOptions;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionSnowflakeOptions)
  snowflakeOptions?: ConnectionSnowflakeOptions;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionMysqlOptions)
  mysqlOptions?: ConnectionMysqlOptions;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionStoreApiOptions)
  storeApiOptions?: ConnectionStoreApiOptions;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionStoreGoogleApiOptions)
  storeGoogleApiOptions?: ConnectionStoreGoogleApiOptions;

  @IsOptional()
  @IsInt()
  serverTs?: number;
}
