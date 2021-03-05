import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetModelsListRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;
}

export class ToBackendGetModelsListRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetModelsListRequestPayload)
  payload: ToBackendGetModelsListRequestPayload;
}

export class ToBackendGetModelsListResponsePayload {
  @ValidateNested()
  @Type(() => common.ModelsItem)
  modelsList: common.ModelsItem[];
}

export class ToBackendGetModelsListResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetModelsListResponsePayload)
  payload: ToBackendGetModelsListResponsePayload;
}
