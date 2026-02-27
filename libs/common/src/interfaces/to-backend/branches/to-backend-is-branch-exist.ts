import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendIsBranchExistRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  branchId: string;

  @IsString()
  repoId: string;
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

export class ToBackendIsBranchExistResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendIsBranchExistResponsePayload)
  payload: ToBackendIsBranchExistResponsePayload;
}
