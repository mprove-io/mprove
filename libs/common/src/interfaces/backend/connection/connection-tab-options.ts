import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { OptionsBigquery } from './options-bigquery';
import { OptionsClickhouse } from './options-clickhouse';
import { OptionsMotherduck } from './options-motherduck';
import { OptionsMysql } from './options-mysql';
import { OptionsPostgres } from './options-postgres';
import { OptionsPresto } from './options-presto';
import { OptionsSnowflake } from './options-snowflake';
import { OptionsStoreApi } from './options-store-api';
import { OptionsStoreGoogleApi } from './options-store-google-api';
import { OptionsTrino } from './options-trino';

export class ConnectionTabOptions {
  @IsOptional()
  @ValidateNested()
  @Type(() => OptionsBigquery)
  bigquery?: OptionsBigquery;

  @IsOptional()
  @ValidateNested()
  @Type(() => OptionsClickhouse)
  clickhouse?: OptionsClickhouse;

  @IsOptional()
  @ValidateNested()
  @Type(() => OptionsMotherduck)
  motherduck?: OptionsMotherduck;

  @IsOptional()
  @ValidateNested()
  @Type(() => OptionsPostgres)
  postgres?: OptionsPostgres;

  @IsOptional()
  @ValidateNested()
  @Type(() => OptionsSnowflake)
  snowflake?: OptionsSnowflake;

  @IsOptional()
  @ValidateNested()
  @Type(() => OptionsMysql)
  mysql?: OptionsMysql;

  @IsOptional()
  @ValidateNested()
  @Type(() => OptionsTrino)
  trino?: OptionsTrino;

  @IsOptional()
  @ValidateNested()
  @Type(() => OptionsPresto)
  presto?: OptionsPresto;

  @IsOptional()
  @ValidateNested()
  @Type(() => OptionsStoreApi)
  storeApi?: OptionsStoreApi;

  @IsOptional()
  @ValidateNested()
  @Type(() => OptionsStoreGoogleApi)
  storeGoogleApi?: OptionsStoreGoogleApi;
}
