import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetModelsRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsOptional()
  @IsString({ each: true })
  filterByModelIds?: string[];

  @IsOptional()
  @IsBoolean()
  addFields?: boolean;
}

export class ToBackendGetModelsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetModelsRequestPayload)
  payload: ToBackendGetModelsRequestPayload;
}

export class ToBackendGetModelsResponsePayload {
  @IsBoolean()
  isBranchExist: boolean;

  @IsBoolean()
  needValidate: boolean;

  @ValidateNested()
  @Type(() => common.Repo)
  struct: common.Struct;

  @ValidateNested()
  @Type(() => common.Member)
  userMember: common.Member;

  @ValidateNested()
  @Type(() => common.ModelX)
  models: common.ModelX[];
}

export class ToBackendGetModelsResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetModelsResponsePayload)
  payload: ToBackendGetModelsResponsePayload;
}
