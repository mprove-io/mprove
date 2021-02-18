import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetModelRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsString()
  modelId: string;
}

export class ToBackendGetModelRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetModelRequestPayload)
  payload: ToBackendGetModelRequestPayload;
}

export class ToBackendGetModelResponsePayload {
  @ValidateNested()
  @Type(() => common.Model)
  model: common.Model;
}

export class ToBackendGetModelResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetModelResponsePayload)
  payload: ToBackendGetModelResponsePayload;
}