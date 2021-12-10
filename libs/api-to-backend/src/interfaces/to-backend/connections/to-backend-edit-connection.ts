import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendEditConnectionRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  connectionId: string;

  @IsOptional()
  bigqueryCredentials?: any;

  @IsOptional()
  @IsInt()
  bigqueryQuerySizeLimitGb?: number;

  @IsOptional()
  @IsString()
  postgresHost?: string;

  @IsOptional()
  @IsInt()
  postgresPort?: number;

  @IsOptional()
  @IsString()
  postgresDatabase?: string;

  @IsOptional()
  @IsString()
  postgresUser?: string;

  @IsOptional()
  @IsString()
  postgresPassword?: string;
}

export class ToBackendEditConnectionRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendEditConnectionRequestPayload)
  payload: ToBackendEditConnectionRequestPayload;
}

export class ToBackendEditConnectionResponsePayload {
  @ValidateNested()
  @Type(() => common.Connection)
  connection: common.Connection;
}

export class ToBackendEditConnectionResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendEditConnectionResponsePayload)
  payload: ToBackendEditConnectionResponsePayload;
}
