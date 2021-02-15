import { Type } from 'class-transformer';
import {
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
  connectionId: string;

  @IsEnum(common.ConnectionTypeEnum)
  type: common.ConnectionTypeEnum;

  @IsOptional()
  @IsString()
  bigqueryCredentials?: string;

  @IsOptional()
  @IsInt()
  bigqueryQuerySizeLimit?: number;

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
