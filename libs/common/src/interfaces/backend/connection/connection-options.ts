import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { ConnectionOptionsBigquery } from './connection-options-bigquery';
import { ConnectionOptionsClickhouse } from './connection-options-clickhouse';
import { ConnectionOptionsMotherduck } from './connection-options-motherduck';
import { ConnectionOptionsMysql } from './connection-options-mysql';
import { ConnectionOptionsPostgres } from './connection-options-postgres';
import { ConnectionOptionsPresto } from './connection-options-presto';
import { ConnectionOptionsSnowflake } from './connection-options-snowflake';
import { ConnectionOptionsStoreApi } from './connection-options-store-api';
import { ConnectionOptionsStoreGoogleApi } from './connection-options-store-google-api';
import { ConnectionOptionsTrino } from './connection-options-trino';

export class ConnectionOptions {
  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionOptionsBigquery)
  bigquery?: ConnectionOptionsBigquery;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionOptionsClickhouse)
  clickhouse?: ConnectionOptionsClickhouse;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionOptionsMotherduck)
  motherduck?: ConnectionOptionsMotherduck;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionOptionsPostgres)
  postgres?: ConnectionOptionsPostgres;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionOptionsSnowflake)
  snowflake?: ConnectionOptionsSnowflake;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionOptionsMysql)
  mysql?: ConnectionOptionsMysql;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionOptionsTrino)
  trino?: ConnectionOptionsTrino;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionOptionsPresto)
  presto?: ConnectionOptionsPresto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionOptionsStoreApi)
  storeApi?: ConnectionOptionsStoreApi;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionOptionsStoreGoogleApi)
  storeGoogleApi?: ConnectionOptionsStoreGoogleApi;
}
