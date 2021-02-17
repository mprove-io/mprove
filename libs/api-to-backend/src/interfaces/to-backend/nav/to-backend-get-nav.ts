import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetNavRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;
}

export class ToBackendGetNavRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetNavRequestPayload)
  payload: ToBackendGetNavRequestPayload;
}

export class ToBackendGetNavResponsePayload {
  @IsString()
  avatarSmall: string;

  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;
}

export class ToBackendGetNavResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetNavResponsePayload)
  payload: ToBackendGetNavResponsePayload;
}
