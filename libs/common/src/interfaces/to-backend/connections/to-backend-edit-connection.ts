import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { ConnectionBigqueryOptions } from '~common/interfaces/backend/connection/connection-bigquery-options';
import { ConnectionClickhouseOptions } from '~common/interfaces/backend/connection/connection-clickhouse-options';
import { ConnectionMotherduckOptions } from '~common/interfaces/backend/connection/connection-motherduck-options';
import { ConnectionPostgresOptions } from '~common/interfaces/backend/connection/connection-postgres-options';
import { ConnectionSnowflakeOptions } from '~common/interfaces/backend/connection/connection-snowflake-options';
import { ConnectionStoreApiOptions } from '~common/interfaces/backend/connection/connection-store-api-options';
import { ConnectionStoreGoogleApiOptions } from '~common/interfaces/backend/connection/connection-store-google-api-options';
import { ProjectConnection } from '~common/interfaces/backend/project-connection';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendEditConnectionRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;

  @IsString()
  connectionId: string;

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
  @Type(() => ConnectionStoreApiOptions)
  storeApiOptions?: ConnectionStoreApiOptions;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionStoreGoogleApiOptions)
  storeGoogleApiOptions?: ConnectionStoreGoogleApiOptions;
}

export class ToBackendEditConnectionRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendEditConnectionRequestPayload)
  payload: ToBackendEditConnectionRequestPayload;
}

export class ToBackendEditConnectionResponsePayload {
  @ValidateNested()
  @Type(() => ProjectConnection)
  connection: ProjectConnection;
}

export class ToBackendEditConnectionResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendEditConnectionResponsePayload)
  payload: ToBackendEditConnectionResponsePayload;
}
