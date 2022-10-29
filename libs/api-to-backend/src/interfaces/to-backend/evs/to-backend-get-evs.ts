import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetEvsRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;
}

export class ToBackendGetEvsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetEvsRequestPayload)
  payload: ToBackendGetEvsRequestPayload;
}

export class ToBackendGetEvsResponsePayload {
  @ValidateNested()
  @Type(() => common.Member)
  userMember: common.Member;

  @ValidateNested()
  @Type(() => common.Ev)
  evs: common.Ev[];
}

export class ToBackendGetEvsResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetEvsResponsePayload)
  payload: ToBackendGetEvsResponsePayload;
}
