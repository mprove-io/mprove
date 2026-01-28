import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { ModelInfo } from '#common/interfaces/backend/model-info';
import { StructX } from '#common/interfaces/backend/struct-x';
import { Repo } from '#common/interfaces/disk/repo';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendCreateFileRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  parentNodeId: string;

  @IsString()
  fileName: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ModelInfo)
  modelInfo?: ModelInfo;
}

export class ToBackendCreateFileRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateFileRequestPayload)
  payload: ToBackendCreateFileRequestPayload;
}

export class ToBackendCreateFileResponsePayload {
  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;

  @ValidateNested()
  @Type(() => StructX)
  struct: StructX;

  @IsBoolean()
  needValidate: boolean;
}

export class ToBackendCreateFileResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateFileResponsePayload)
  payload: ToBackendCreateFileResponsePayload;
}
