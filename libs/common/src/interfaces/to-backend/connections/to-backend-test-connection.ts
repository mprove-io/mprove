import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { StoreMethodEnum } from '#common/enums/store-method.enum';
import { ConnectionOptions } from '#common/interfaces/backend/connection-parts/connection-options';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class TestConnectionResult {
  @IsBoolean()
  isSuccess: boolean;

  @IsString()
  errorMessage: string;
}

export class ToBackendTestConnectionRequestPayload {
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
  options: ConnectionOptions;

  @IsOptional()
  @IsEnum(StoreMethodEnum)
  storeMethod: StoreMethodEnum;
}

export class ToBackendTestConnectionRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendTestConnectionRequestPayload)
  payload: ToBackendTestConnectionRequestPayload;
}

export class ToBackendTestConnectionResponsePayload {
  @ValidateNested()
  @Type(() => TestConnectionResult)
  testConnectionResult: TestConnectionResult;
}

export class ToBackendTestConnectionResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendTestConnectionResponsePayload)
  payload: ToBackendTestConnectionResponsePayload;
}
