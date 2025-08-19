import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { Member } from '~common/interfaces/backend/member';
import { ModelX } from '~common/interfaces/backend/model-x';
import { Struct } from '~common/interfaces/backend/struct';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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

  @IsOptional()
  @IsBoolean()
  addContent?: boolean;
}

export class ToBackendGetModelsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetModelsRequestPayload)
  payload: ToBackendGetModelsRequestPayload;
}

export class ToBackendGetModelsResponsePayload {
  @IsBoolean()
  needValidate: boolean;

  @ValidateNested()
  @Type(() => Struct)
  struct: Struct;

  @ValidateNested()
  @Type(() => Member)
  userMember: Member;

  @ValidateNested()
  @Type(() => ModelX)
  models: ModelX[];
}

export class ToBackendGetModelsResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetModelsResponsePayload)
  payload: ToBackendGetModelsResponsePayload;
}
