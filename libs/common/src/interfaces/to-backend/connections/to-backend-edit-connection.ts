import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { ProjectConnection } from '~common/interfaces/backend/connection';
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
  @IsString()
  baseUrl?: string;

  @IsOptional()
  @IsString()
  motherduckToken?: string;

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
