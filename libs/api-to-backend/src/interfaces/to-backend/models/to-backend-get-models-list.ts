import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetModelsListRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  branchId: string;
}

export class ToBackendGetModelsListRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetModelsListRequestPayload)
  payload: ToBackendGetModelsListRequestPayload;
}

export class ToBackendGetModelsListResponsePayloadModelsItem {
  @IsString()
  modelId: string;

  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  gr?: string;

  @IsBoolean()
  hidden: boolean;
}

export class ToBackendGetModelsListResponsePayload {
  @ValidateNested()
  @Type(() => ToBackendGetModelsListResponsePayloadModelsItem)
  modelsList: ToBackendGetModelsListResponsePayloadModelsItem[];
}

export class ToBackendGetModelsListResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetModelsListResponsePayload)
  payload: ToBackendGetModelsListResponsePayload;
}
