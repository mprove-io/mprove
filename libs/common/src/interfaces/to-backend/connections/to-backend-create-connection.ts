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
import { Connection } from '~common/interfaces/backend/connection';
import { ConnectionHeader } from '~common/interfaces/backend/connection-header';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendCreateConnectionRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;

  @IsString()
  connectionId: string;

  @IsEnum(ConnectionTypeEnum)
  type: ConnectionTypeEnum;

  @IsOptional()
  @IsString()
  baseUrl?: string;

  @IsOptional()
  serviceAccountCredentials?: any;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionHeader)
  headers?: ConnectionHeader[];

  @IsOptional()
  @IsString({ each: true })
  googleAuthScopes?: string[];

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
  @Type(() => Connection)
  connection: Connection;
}

export class ToBackendCreateConnectionResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateConnectionResponsePayload)
  payload: ToBackendCreateConnectionResponsePayload;
}
