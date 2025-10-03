import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { ConnectionOptions } from '~common/interfaces/backend/connection/connection-options';
import { ProjectConnection } from '~common/interfaces/backend/project-connection';
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
  @ValidateNested()
  @Type(() => ConnectionOptions)
  options?: ConnectionOptions;
}

export class ToBackendCreateConnectionRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateConnectionRequestPayload)
  payload: ToBackendCreateConnectionRequestPayload;
}

export class ToBackendCreateConnectionResponsePayload {
  @ValidateNested()
  @Type(() => ProjectConnection)
  connection: ProjectConnection;
}

export class ToBackendCreateConnectionResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateConnectionResponsePayload)
  payload: ToBackendCreateConnectionResponsePayload;
}
