import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { Connection } from '~api-to-backend/interfaces/ints/_index';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendEditConnectionRequestPayload {
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

export class ToBackendEditConnectionRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendEditConnectionRequestPayload)
  payload: ToBackendEditConnectionRequestPayload;
}

export class ToBackendEditConnectionResponsePayload {
  @ValidateNested()
  @Type(() => Connection)
  projectConnections: Connection[];
}

export class ToBackendEditConnectionResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendEditConnectionResponsePayload)
  payload: ToBackendEditConnectionResponsePayload;
}
