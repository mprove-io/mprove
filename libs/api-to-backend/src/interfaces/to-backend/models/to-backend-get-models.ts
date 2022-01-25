import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetModelsRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;
}

export class ToBackendGetModelsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetModelsRequestPayload)
  payload: ToBackendGetModelsRequestPayload;
}

export class ToBackendGetModelsResponsePayload {
  @ValidateNested()
  @Type(() => common.ModelX)
  models: common.ModelX[];
}

export class ToBackendGetModelsResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetModelsResponsePayload)
  payload: ToBackendGetModelsResponsePayload;
}