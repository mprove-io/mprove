import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendIsBranchExistRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  branchId: string;

  @IsBoolean()
  isRepoProd: boolean;
}

export class ToBackendIsBranchExistRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendIsBranchExistRequestPayload)
  payload: ToBackendIsBranchExistRequestPayload;
}

export class ToBackendIsBranchExistResponsePayload {
  @IsBoolean()
  isExist: boolean;
}

export class ToBackendIsBranchExistResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendIsBranchExistResponsePayload)
  payload: ToBackendIsBranchExistResponsePayload;
}
