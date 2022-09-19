import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCreateConnectionRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;

  @IsString()
  connectionId: string;

  @IsEnum(common.ConnectionTypeEnum)
  type: common.ConnectionTypeEnum;

  @IsOptional()
  bigqueryCredentials?: any;

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
  @IsString()
  password?: string;

  @IsOptional()
  @IsBoolean()
  isSSL?: boolean;
}

export class ToBackendCreateConnectionRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateConnectionRequestPayload)
  payload: ToBackendCreateConnectionRequestPayload;
}

export class ToBackendCreateConnectionResponsePayload {
  @ValidateNested()
  @Type(() => common.Connection)
  connection: common.Connection;
}

export class ToBackendCreateConnectionResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateConnectionResponsePayload)
  payload: ToBackendCreateConnectionResponsePayload;
}
