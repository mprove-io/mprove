import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Model } from 'echarts';
import { Member } from '~common/interfaces/backend/member';
import { Struct } from '~common/interfaces/backend/struct';
import { MyResponse } from '~common/interfaces/to/my-response';
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
  @Type(() => Struct)
  struct: Struct;

  @ValidateNested()
  @Type(() => Member)
  userMember: Member;

  @ValidateNested()
  @Type(() => Model)
  model: Model;
}

export class ToBackendGetModelResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetModelResponsePayload)
  payload: ToBackendGetModelResponsePayload;
}
