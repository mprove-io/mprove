import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Member } from '~common/interfaces/backend/member';
import { Struct } from '~common/interfaces/backend/struct';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetStructRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;
}

export class ToBackendGetStructRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetStructRequestPayload)
  payload: ToBackendGetStructRequestPayload;
}

export class ToBackendGetStructResponsePayload {
  @IsBoolean()
  needValidate: boolean;

  @ValidateNested()
  @Type(() => Struct)
  struct: Struct;

  @ValidateNested()
  @Type(() => Member)
  userMember: Member;
}

export class ToBackendGetStructResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetStructResponsePayload)
  payload: ToBackendGetStructResponsePayload;
}
