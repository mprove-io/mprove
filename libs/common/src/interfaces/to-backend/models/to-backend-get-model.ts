import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Member } from '#common/interfaces/backend/member';
import { ModelX } from '#common/interfaces/backend/model-x';
import { StructX } from '#common/interfaces/backend/struct-x';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetModelRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  modelId: string;
}

export class ToBackendGetModelRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetModelRequestPayload)
  payload: ToBackendGetModelRequestPayload;
}

export class ToBackendGetModelResponsePayload {
  @IsBoolean()
  needValidate: boolean;

  @ValidateNested()
  @Type(() => StructX)
  struct: StructX;

  @ValidateNested()
  @Type(() => Member)
  userMember: Member;

  @ValidateNested()
  @Type(() => ModelX)
  model: ModelX;
}

export class ToBackendGetModelResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetModelResponsePayload)
  payload: ToBackendGetModelResponsePayload;
}
